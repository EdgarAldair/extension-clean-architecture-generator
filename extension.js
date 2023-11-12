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

        // Crea el archivo de la interfaz del data source en la carpeta domain
        const iDataSourceFilePath = path.join(carpetaFeat, 'domain', `i_${nombreModelo}_data_source.dart`);
        fs.writeFileSync(iDataSourceFilePath, generateIDataSourceFileContent(nombreModelo));

        // Crea el archivo de la interfaz del facade en la carpeta domain
        const iFacadeFilePath = path.join(carpetaFeat, 'domain', `i_${nombreModelo}_facade.dart`);
        fs.writeFileSync(iFacadeFilePath, generateIFacadeFileContent(nombreModelo));

        // Crea el archivo del data source impl en la carpeta infrastructure
        const dataSourceImplFilePath = path.join(carpetaFeat, 'infrastructure', `${nombreModelo.toLowerCase()}_data_source_impl.dart`);
        fs.writeFileSync(dataSourceImplFilePath, generateDataSourceImplFileContent(nombreModelo));

        // Crea el archivo del facade impl en la carpeta infrastructure
        const facadeImplFilePath = path.join(carpetaFeat, 'infrastructure', `${nombreModelo.toLowerCase()}_facade_impl.dart`);
        fs.writeFileSync(facadeImplFilePath, generateFacadeImplFileContent(nombreModelo));
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

function generateIDataSourceFileContent(nombreModelo) {
    const nombreModeloConMayuscula = nombreModelo.charAt(0).toUpperCase() + nombreModelo.slice(1).toLowerCase();

    // Contenido del archivo de la interfaz del data source
    let content = `import '${nombreModelo.toLowerCase()}.dart';

abstract class I${nombreModeloConMayuscula}DataSource {
  Future<${nombreModeloConMayuscula}>  ${nombreModelo.toLowerCase()}(${nombreModeloConMayuscula} ${nombreModelo});
}
`;

    return content;
}

function generateIFacadeFileContent(nombreModelo) {
    const nombreModeloConMayuscula = nombreModelo.charAt(0).toUpperCase() + nombreModelo.slice(1).toLowerCase();

    // Contenido del archivo de la interfaz del facade
    let content = `import '${nombreModelo.toLowerCase()}.dart';

abstract class I${nombreModeloConMayuscula}Facade {
  Future<${nombreModeloConMayuscula}>  ${nombreModelo.toLowerCase()}(${nombreModeloConMayuscula} ${nombreModelo});
}
`;

    return content;
}

function generateDataSourceImplFileContent(nombreModelo) {
    const nombreModeloConMayuscula = nombreModelo.charAt(0).toUpperCase() + nombreModelo.slice(1).toLowerCase();

    // Contenido del archivo del data source impl
    let content = `import 'package:dio/dio.dart';
import 'package:injectable/injectable.dart';

import '../../core/domain/utils.dart';
import '../domain/i_${nombreModelo}_data_source.dart';
import '../domain/${nombreModelo.toLowerCase()}.dart';

@Injectable(as: I${nombreModeloConMayuscula}DataSource)
class ${nombreModeloConMayuscula}DataSourceImpl implements I${nombreModeloConMayuscula}DataSource {
  ${nombreModeloConMayuscula}DataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<${nombreModeloConMayuscula}> ${nombreModelo.toLowerCase()}(${nombreModeloConMayuscula} ${nombreModelo}) async {
    final res = await _dio.post<Json>(
      "TU_API_AQUI",
      data: ${nombreModelo}.toJson(),
    );
    return ${nombreModeloConMayuscula}.fromJson(res.data);
  }
}
`;

    return content;
}

function generateFacadeImplFileContent(nombreModelo) {
    const nombreModeloConMayuscula = nombreModelo.charAt(0).toUpperCase() + nombreModelo.slice(1).toLowerCase();

    // Contenido del archivo del facade impl
    let content = `import 'package:injectable/injectable.dart';

import '../domain/i_${nombreModelo}_data_source.dart';
import '../domain/i_${nombreModelo}_facade.dart';
import '../domain/${nombreModelo.toLowerCase()}.dart';

@Injectable(as: I${nombreModeloConMayuscula}Facade)
class ${nombreModeloConMayuscula}FacadeImpl extends I${nombreModeloConMayuscula}Facade {
  ${nombreModeloConMayuscula}FacadeImpl(this._source);

  final I${nombreModeloConMayuscula}DataSource _source;

  @override
  Future<${nombreModeloConMayuscula}> ${nombreModelo.toLowerCase()}(
    ${nombreModeloConMayuscula} ${nombreModelo},
  ) {
    return _source.${nombreModelo.toLowerCase()}(${nombreModelo});
  }
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
            return `json?['${campo.nombre}'] != null ? DateTime.parse(json['${campo.nombre}']) : ${campo.required ? 'DateTime.now()' : ' DateTime.now()'}`;
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
