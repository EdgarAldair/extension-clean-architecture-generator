const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function generarEstructuraDeArchivos(nombreFeat, nombreModelo, campos) {
    if (nombreFeat && nombreModelo && campos.length > 0) {
        const carpetaFeat = path.join(vscode.workspace.rootPath || '', 'lib', nombreFeat);

        fs.mkdirSync(carpetaFeat);
        fs.mkdirSync(path.join(carpetaFeat, 'application'));
        fs.mkdirSync(path.join(carpetaFeat, 'domain'));
        fs.mkdirSync(path.join(carpetaFeat, 'infrastructure'));
        fs.mkdirSync(path.join(carpetaFeat, 'presentation'));

		 const nombreModeloTransformado = transformarNombreModelo(nombreModelo);

        const modeloFilePath = path.join(carpetaFeat, 'domain', `${nombreModelo}.dart`);
        fs.writeFileSync(modeloFilePath, generateDartFileContent(nombreModelo, campos));

        const iDataSourceFilePath = path.join(carpetaFeat, 'domain', `i_${nombreModelo}_data_source.dart`);
        fs.writeFileSync(iDataSourceFilePath, generateIDataSourceFileContent(nombreModelo));

        const iFacadeFilePath = path.join(carpetaFeat, 'domain', `i_${nombreModelo}_facade.dart`);
        fs.writeFileSync(iFacadeFilePath, generateIFacadeFileContent(nombreModelo));

        const dataSourceImplFilePath = path.join(carpetaFeat, 'infrastructure', `${nombreModelo.toLowerCase()}_data_source_impl.dart`);
        fs.writeFileSync(dataSourceImplFilePath, generateDataSourceImplFileContent(nombreModelo));

        const facadeImplFilePath = path.join(carpetaFeat, 'infrastructure', `${nombreModelo.toLowerCase()}_facade_impl.dart`);
        fs.writeFileSync(facadeImplFilePath, generateFacadeImplFileContent(nombreModelo));

        const blocFilePath = path.join(carpetaFeat, 'application', `${nombreModelo.toLowerCase()}_bloc.dart`);
        const eventFilePath = path.join(carpetaFeat, 'application', `${nombreModelo.toLowerCase()}_event.dart`);
        const stateFilePath = path.join(carpetaFeat, 'application', `${nombreModelo.toLowerCase()}_state.dart`);

        fs.writeFileSync(blocFilePath, generateBlocFileContent(nombreModelo));
        fs.writeFileSync(eventFilePath, generateEventFileContent(nombreModelo));
        fs.writeFileSync(stateFilePath, generateStateFileContent(nombreModelo));
    }
}


function transformarNombreModelo(nombreModelo) {
    const partes = nombreModelo.split('_');
    
    const nombreTransformado = partes.map(parte => parte.charAt(0).toUpperCase() + parte.slice(1)).join('');

    return nombreTransformado;
}

function transformarNombreModeloCamelCase(nombreModelo) {
    const partes = nombreModelo.split('_');
    
    const nombreTransformadoACamelCase = partes.map((parte, index) => {
        if (index === 0) {
            return parte;
        }
        return parte.charAt(0).toUpperCase() + parte.slice(1);
    }).join('');

    return nombreTransformadoACamelCase;
}



function generateBlocFileContent(nombreModelo) {
    const nombreModeloLaPrimeraMayuscula = transformarNombreModelo(nombreModelo);

    let content = `import 'package:bloc/bloc.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:injectable/injectable.dart';

import '../domain/i_${nombreModelo}_facade.dart';
import '../domain/${nombreModelo.toLowerCase()}.dart';

part '${nombreModelo.toLowerCase()}_event.dart';
part '${nombreModelo.toLowerCase()}_state.dart';
part '${nombreModelo.toLowerCase()}_bloc.freezed.dart';

@injectable
class ${nombreModeloLaPrimeraMayuscula}Bloc extends Bloc<${nombreModeloLaPrimeraMayuscula}Event, ${nombreModeloLaPrimeraMayuscula}State> {
  ${nombreModeloLaPrimeraMayuscula}Bloc(I${nombreModeloLaPrimeraMayuscula}Facade facade)
      : super(${nombreModeloLaPrimeraMayuscula}State.initial()) {
    on<_${nombreModeloLaPrimeraMayuscula}Event>((event, emit) async {
      emit(
        state.copyWith(
          isLoading: true,
        ),
      );

      final ${transformarNombreModeloCamelCase(nombreModelo)} = await facade.${transformarNombreModeloCamelCase(nombreModelo)}(event.${transformarNombreModeloCamelCase(nombreModelo)});
      emit(
        state.copyWith(
          isLoading: false,
          ${transformarNombreModeloCamelCase(nombreModelo)}: event.${transformarNombreModeloCamelCase(nombreModelo)},
        ),
      );
    });
  }
}
`;

    return content;
}

function generateEventFileContent(nombreModelo) {
    const nombreModeloLaPrimeraMayuscula = transformarNombreModelo(nombreModelo);
    let content = `part of '${nombreModelo.toLowerCase()}_bloc.dart';

@freezed
class ${nombreModeloLaPrimeraMayuscula}Event with _$${nombreModeloLaPrimeraMayuscula}Event {
  const factory ${nombreModeloLaPrimeraMayuscula}Event.${transformarNombreModeloCamelCase(nombreModelo)}({
    required ${nombreModeloLaPrimeraMayuscula} ${transformarNombreModeloCamelCase(nombreModelo)},
  }) = _${nombreModeloLaPrimeraMayuscula}Event;
}
`;

    return content;
}

function generateStateFileContent(nombreModelo) {
    const nombreModeloLaPrimeraMayuscula = transformarNombreModelo(nombreModelo);

    let content = `part of '${nombreModelo.toLowerCase()}_bloc.dart';

@freezed
class ${nombreModeloLaPrimeraMayuscula}State with _$${nombreModeloLaPrimeraMayuscula}State {
  const factory ${nombreModeloLaPrimeraMayuscula}State({
    required bool isLoading,
    ${nombreModeloLaPrimeraMayuscula}? ${transformarNombreModeloCamelCase(nombreModelo)},
  }) = _${nombreModeloLaPrimeraMayuscula}State;

  factory ${nombreModeloLaPrimeraMayuscula}State.initial() =>
      const ${nombreModeloLaPrimeraMayuscula}State(isLoading: false);
}
`;

    return content;
}

function generateDartFileContent(nombreModelo, campos) {
    const nombreModeloConMayuscula =transformarNombreModelo(nombreModelo);

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
    const nombreModeloConMayuscula = transformarNombreModelo(nombreModelo);

    let content = `import '${nombreModelo.toLowerCase()}.dart';

abstract class I${nombreModeloConMayuscula}DataSource {
  Future<${nombreModeloConMayuscula}>  ${transformarNombreModeloCamelCase(nombreModelo)}(${nombreModeloConMayuscula} ${transformarNombreModeloCamelCase(nombreModelo)});
}
`;

    return content;
}

function generateIFacadeFileContent(nombreModelo) {
    const nombreModeloConMayuscula = transformarNombreModelo(nombreModelo);

    let content = `import '${nombreModelo.toLowerCase()}.dart';

abstract class I${nombreModeloConMayuscula}Facade {
  Future<${nombreModeloConMayuscula}>  ${transformarNombreModeloCamelCase(nombreModelo)}(${nombreModeloConMayuscula} ${transformarNombreModeloCamelCase(nombreModelo)});
}
`;

    return content;
}

function generateDataSourceImplFileContent(nombreModelo) {
    const nombreModeloConMayuscula = transformarNombreModelo(nombreModelo);

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
  Future<${nombreModeloConMayuscula}> ${transformarNombreModeloCamelCase(nombreModelo)}(${nombreModeloConMayuscula} ${transformarNombreModeloCamelCase(nombreModelo)}) async {
    final res = await _dio.post<Json>(
      "TU_API_AQUI",
      data: ${transformarNombreModeloCamelCase(nombreModelo)}.toJson(),
    );
    return ${nombreModeloConMayuscula}.fromJson(res.data);
  }
}
`;

    return content;
}

function generateFacadeImplFileContent(nombreModelo) {
    const nombreModeloConMayuscula = transformarNombreModelo(nombreModelo);

    let content = `import 'package:injectable/injectable.dart';

import '../domain/i_${nombreModelo}_data_source.dart';
import '../domain/i_${nombreModelo}_facade.dart';
import '../domain/${nombreModelo.toLowerCase()}.dart';

@Injectable(as: I${nombreModeloConMayuscula}Facade)
class ${nombreModeloConMayuscula}FacadeImpl extends I${nombreModeloConMayuscula}Facade {
  ${nombreModeloConMayuscula}FacadeImpl(this._source);

  final I${nombreModeloConMayuscula}DataSource _source;

  @override
  Future<${nombreModeloConMayuscula}> ${transformarNombreModeloCamelCase(nombreModelo)}(
    ${nombreModeloConMayuscula} ${transformarNombreModeloCamelCase(nombreModelo)},
  ) {
    return _source.${transformarNombreModeloCamelCase(nombreModelo)}(${transformarNombreModeloCamelCase(nombreModelo)});
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
        default:
            return `${campo.tipo}? ?? ${campo.required ? "''" : "''"} `;
    }
}

async function solicitarInformacionCampo() {
    const nombreCampo = await vscode.window.showInputBox({ prompt: 'Nombre del campo' });

    if (nombreCampo === undefined || nombreCampo.trim() === '') {
        vscode.window.showErrorMessage('Nombre del campo inválido o vacío.');
        return;
    }

    const esRequerido = await vscode.window.showQuickPick(['Sí', 'No'], { placeHolder: '¿Es requerido?' }) === 'Sí';

    const tipoCampo = await vscode.window.showQuickPick(['String', 'int', 'bool', 'DateTime'], { placeHolder: 'Seleccione el tipo de campo' });

    if (tipoCampo === undefined) {
        vscode.window.showErrorMessage('Tipo de campo inválido o no seleccionado.');
        return;
    }

    return {
        nombre: nombreCampo,
        required: esRequerido,
    };
}

async function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generarCodigo', async () => {
        const nombreFeat = await vscode.window.showInputBox({ prompt: 'Nombre del feat' });

        if (nombreFeat === undefined || nombreFeat.trim() === '') {
            vscode.window.showErrorMessage('Nombre del feat inválido o vacío.');
            return;
        }

        const nombreModelo = await vscode.window.showInputBox({ prompt: 'Nombre del modelo' });

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

function deactivate() {}

module.exports = {
    activate,
    deactivate
};