const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function generarEstructuraDeArchivos(nombreFeat, nombreModelo, campos) {
    if (nombreFeat && nombreModelo && campos.length > 0) {
        const carpetaFeat = path.join(vscode.workspace.rootPath || '', 'lib', nombreFeat);

        // Crea la estructura de carpetas
        fs.mkdirSync(carpetaFeat);
        fs.mkdirSync(path.join(carpetaFeat, 'application'));
        fs.mkdirSync(path.join(carpetaFeat, 'domain'));
        fs.mkdirSync(path.join(carpetaFeat, 'infrastructure'));
        fs.mkdirSync(path.join(carpetaFeat, 'presentation'));

        // Crea el archivo del modelo en la carpeta domain
        const modeloFilePath = path.join(carpetaFeat, 'domain', `${nombreModelo}.dart`);
        fs.writeFileSync(modeloFilePath, generateDartFileContent(nombreModelo, campos));
    }
}

function generateDartFileContent(nombreModelo, campos) {
    const nombreModeloConMayuscula = nombreModelo.charAt(0).toUpperCase() + nombreModelo.slice(1).toLowerCase();

    // Contenido del archivo Dart
    let content = `import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

import '../../core/domain/utils.dart';

part '${nombreModelo}.g.dart';

@JsonSerializable()
class ${nombreModeloConMayuscula} extends Equatable {
  const ${nombreModeloConMayuscula}({
    ${campos.map(campo => `${campo.required ? 'required ' : ''}this.${campo.nombre},`).join('\n    ')}
  });

  factory ${nombreModeloConMayuscula}.fromJson(Map<dynamic, dynamic>? json) {
    return ${nombreModeloConMayuscula}(
      ${campos.map(campo => `${campo.nombre}: ${generarValorPorTipo(campo)},`).join('\n      ')}
    );
  }

  ${campos.map(campo => `final ${campo.tipo === 'string' ? 'String' : campo.tipo}${campo.required ? '' : '?'} ${campo.nombre};`).join('\n\n  ')}

  @override
  List<Object?> get props {
    return [
      ${campos.map(campo => campo.nombre).join(',\n      ')}
    ];
  }

  Json toJson() => _$${nombreModeloConMayuscula}ToJson(this);
}
`;

    return content;
}

function generarValorPorTipo(campo) {
    switch (campo.tipo) {
        case 'string':
            return `json?['${campo.nombre}'] as String? ?? ${campo.required ? "''" : "''"} `;
        case 'int':
            return `json?['${campo.nombre}'] as int? ?? ${campo.required ? '0' : '0'} `;
        case 'bool':
            return `json?['${campo.nombre}'] as bool? ?? ${campo.required ? 'false' : 'false'} `;
        case 'datetime':
            return `json?['${campo.nombre}'] as DateTime? ?? ${campo.required ? 'DateTime.now()' : ' DateTime.now()'}`;
        // Agrega más casos según sea necesario
        default:
            return `${campo.tipo}? ?? ${campo.required ? "''" : "''"} `;
    }

}

async function solicitarInformacionCampo() {
    const nombreCampo = await vscode.window.showInputBox({ prompt: 'Nombre del campo' });

    // Verifica si el usuario canceló la entrada o no proporcionó un nombre
    if (nombreCampo === undefined || nombreCampo.trim() === '') {
        vscode.window.showErrorMessage('Nombre del campo inválido o vacío.');
        return;
    }

    const esRequerido = await vscode.window.showQuickPick(['Sí', 'No'], { placeHolder: '¿Es requerido?' }) === 'Sí';

    const tipoCampo = await vscode.window.showQuickPick(['String', 'int', 'bool', 'DateTime'], { placeHolder: 'Seleccione el tipo de campo' });

    // Verifica si el usuario canceló la entrada o no proporcionó un tipo de campo
    if (tipoCampo === undefined) {
        vscode.window.showErrorMessage('Tipo de campo inválido o no seleccionado.');
        return;
    }

    return {
        nombre: nombreCampo,
        tipo: tipoCampo.toLowerCase(), // Se utiliza toLowerCase() para garantizar la consistencia
        required: esRequerido,
    };
}

// This method is called when your extension is activated
async function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generarCodigo', async () => {
        const nombreFeat = await vscode.window.showInputBox({ prompt: 'Nombre del feat' });

        // Verifica si el usuario canceló la entrada o no proporcionó un nombre
        if (nombreFeat === undefined || nombreFeat.trim() === '') {
            vscode.window.showErrorMessage('Nombre del feat inválido o vacío.');
            return;
        }

        const nombreModelo = await vscode.window.showInputBox({ prompt: 'Nombre del modelo' });

        // Verifica si el usuario canceló la entrada o no proporcionó un nombre
        if (nombreModelo === undefined || nombreModelo.trim() === '') {
            vscode.window.showErrorMessage('Nombre del modelo inválido o vacío.');
            return;
        }

        let campos = [];
        let agregarCampo = true;

        do {
            const nuevoCampo = await solicitarInformacionCampo();

            if (nuevoCampo) {
                campos.push(nuevoCampo);

                agregarCampo = await vscode.window.showQuickPick(['Sí', 'No'], { placeHolder: '¿Agregar otro campo?' }) === 'Sí';
            } else {
                agregarCampo = false;
            }

        } while (agregarCampo);

        generarEstructuraDeArchivos(nombreFeat, nombreModelo, campos);
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
