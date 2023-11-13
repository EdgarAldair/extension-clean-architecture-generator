
![Logo](https://github.com/EdgarAldair/extension-clean-architecture-generator/assets/34665443/c489faca-e324-4e90-8858-3ac251e77195)

# Generador de Estructuras Flutter

Esta extensión de Visual Studio Code te ayuda a generar rápidamente la estructura de archivos para tu proyecto Flutter.

## Características

- **Creación de Estructuras**: Genera automáticamente la estructura de carpetas y archivos necesarios para un nuevo feature en tu proyecto Flutter.



- **Modelo de Datos Personalizado**: Define el modelo de datos con campos específicos, como String, int, date o bool, y la extensión generará el código correspondiente.

- **Capas de Arquitectura**: Organiza tu código en las carpetas `[feat]/application`, `[feat]/domain`, `[feat]/infrastructure`, y `[feat]/presentation`.

## Cómo Usar

1. Abre tu proyecto Flutter en Visual Studio Code.

2. Ejecuta el comando `Clean Architecture Generator` desde el menú de comandos de Visual Studio Code.
![App Screenshot](https://github.com/EdgarAldair/extension-clean-architecture-generator/assets/34665443/94292fc6-a39a-4b8a-a038-d9d97e021e45)

3. Ingresa el nombre del feature y del modelo cuando se te solicite.
Es importante que para el nombre del feature elijas la convención kebab-case `nombre-del-feature` siempre en minúsculas

y para el nombre del modelo snake_case `nombre_modelo` siempre en minúsculas


4. Define los campos del modelo, seleccionando el tipo de dato y especificando si es requerido o no.
Los campos del modelo deben ir en minúsculas de esta forma: `nickname` `email` `pssw` etc.

5. La extensión creará automáticamente la estructura de archivos y el código correspondiente en las carpetas adecuadas.

## Ejemplo

Supongamos que deseas crear un feature llamado `Usuario` con un modelo que tiene campos como `nombre`, `edad` y `activo`. La extensión generará automáticamente la siguiente estructura:

| Ruta                                     | Archivo                            |
| -----------------------------------------| -----------------------------------|
| lib/application/                         |                                   |
|   |-- usuario_bloc.dart                  |                                   |
|   |-- usuario_event.dart                 |                                   |
|   |-- usuario_state.dart                 |                                   |
| lib/domain/                              |                                   |
|   |-- i_usuario_data_source.dart         |                                   |
|   |-- i_usuario_facade.dart              |                                   |
|   |-- usuario.dart                       |                                   |
| lib/infrastructure/                      |                                   |
|   |-- usuario_data_source_impl.dart      |                                   |
|   |-- usuario_facade_impl.dart           |                                   |
| lib/presentation/                        |                                   |


## Requisitos

- Este plugin asume que estás utilizando el framework Flutter.

- Asegúrate de tener instaladas las dependencias necesarias, como
 `equatable`, `json_annotation`, `dio`, etc.

## Notas

- Asegúrate de configurar correctamente la URL de la API en el archivo `usuario_data_source_impl.dart` antes de usar la aplicación generada.

## Contribuciones

Si encuentras algún problema o tienes sugerencias para mejorar esta extensión, no dudes en [reportarlo](https://github.com/EdgarAldair/extension-clean-architecture-generator/issues).

---

Espero que encuentres útil esta extensión.

## Autores

- [@EdgarAldair](https://github.com/EdgarAldair)


## Feedback

Si tienes alguna sugerencia con gusto contactame al correo: edgarsaenz243@gmail.com


## 🔗 Links
[![portfolio](https://img.shields.io/badge/check_out_my_theme-e74c3c?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://github.com/EdgarAldair/vscode-vintage-vibrance)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/edgar-saenz/)

