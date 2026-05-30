flowchart LR

    subgraph Modulo1 ["Módulo 1: Activación de Código Proveedor (SOP-SR-02)"]
        %% Actores
        Actor10(("Proveedor"))
        Actor11(("Área de Compras"))
        Actor12(("Soporte a Proveedores"))
        
        %% Casos de Uso
        UC2(["Solicitar Asistencia Inicial (Whatsapp / telefono)"])
        UC3(["Enviar Solicitud Formal (Correo)"])
        UC4(["Completar Excel de Registro"])
        UC6(["Derivar a Soporte TI"])
        UC7(["Ejecuta la activación en el Sistema/BD"])
        UC8(["Validar Activación en Portal"])
        UC9(["Cerrar Ticket (GLPI)"])
        UC67(["Indica procedimiento formal"])
        UC70(["Valida y aprueba los datos"])
        UC72(["Verifica que el proceso funciona correctamente"])

        %% Relaciones
        Actor10 --> UC2
        Actor10 --> UC3
        Actor10 --> UC4
        Actor10 --> UC72
        Actor11 --> UC70
        Actor11 --> UC6
        Actor12 --> UC67
        Actor12 --> UC7
        Actor12 --> UC8
        Actor12 --> UC9
        UC8 -.-> UC72
        UC67 -.-> UC2
        UC70 -.-> UC4
    end

    subgraph Modulo2 ["Módulo 2: Asistencia al Cargar Factura (SOP-05)"]
        %% Actores
        Actor32(("Proveedor"))
        Actor33(("Área de Facturación"))
        Actor34(("Soporte a Proveedores"))
        
        %% Casos de Uso
        UC24(["Reportar Inconveniente (Factura)"])
        UC25(["Solicitar Evidencias/Capturas"])
        UC26(["Habilitar OC en Sistema"])
        UC27(["Diagnosticar otro tipo de Inconveniente"])
        UC28(["Brindar Orientación Funcional"])
        UC29(["Corregir y Re-Cargar Factura"])
        UC30(["Cerrar Ticket (GLPI)"])
        UC77(["Derivar al Área de Facturación"])

        %% Relaciones
        Actor32 --> UC24
        Actor32 --> UC29
        Actor33 --> UC26
        Actor34 --> UC25
        Actor34 --> UC27
        Actor34 --> UC28
        Actor34 --> UC30
        UC25 -.-> UC24
        UC27 -.-> UC24
        UC28 -.-> UC29
    end

    subgraph Modulo3 ["Módulo 3: Asistencia al Cargar Producto (SOP-04)"]
        %% Actores
        Actor50(("Proveedor"))
        Actor51(("Soporte a Proveedores"))
        
        %% Casos de Uso
        UC43(["Reportar Inconveniente (Producto)"])
        UC44(["Analizar Formulario Incompleto"])
        UC45(["Validar Formato de Imágenes del producto (JPG/PNG)"])
        UC46(["Guiar Paso a Paso al Proveedor"])
        UC47(["Registrar Producto Correctamente"])
        UC48(["Cerrar Ticket (GLPI)"])

        %% Relaciones
        Actor50 --> UC43
        Actor50 --> UC47
        Actor51 --> UC44
        Actor51 --> UC45
        Actor51 --> UC46
        Actor51 --> UC48
        UC44 -.-> UC43
        UC46 -.-> UC47
    end

    subgraph Modulo4 ["Módulo Compras: Asistencia en AVD (SOP-06)"]
        %% Actores
        Actor271(("Proveedor"))
        Actor272(("Soporte a Proveedores"))
        Actor273(("Área de Compras"))
        
        %% Casos de Uso
        UC252(["Reportar problema de edición de AVD"])
        UC253(["Proporcionar N° OC y capturas"])
        UC254(["Contactar al comprador asignado"])
        UC255(["Gestionar consulta del AVD"])
        UC256(["Validar existencia y relación con OC"])
        UC257(["Confirmar estado 'Confirmado'"])
        UC258(["Evaluar contexto (ej. monto cero)"])
        UC259(["Orientar sobre restricciones"])
        UC260(["Indicar derivación a comprador asignado"])
        UC261(["Documentar y cerrar ticket en GLPI"])
        UC262(["Evaluar solicitud de corrección"])
        UC263(["Definir acción (ej. nueva OC)"])

        %% Relaciones
        Actor271 --> UC252
        Actor271 --> UC254
        Actor272 --> UC255
        Actor272 --> UC258
        Actor272 --> UC259
        Actor272 --> UC260
        Actor272 --> UC261
        Actor273 --> UC262
        Actor273 --> UC263
        UC252 -.->|"<<include>>"| UC253
        UC255 -.->|"<<include>>"| UC256
        UC255 -.->|"<<include>>"| UC257
        UC258 -.->|"<<extend>>"| UC259
        UC252 -.->|"Desencadena"| UC255
        UC260 -.->|"Guía a"| UC254
        UC254 -.->|"Inicia proceso"| UC262
    end

    subgraph Modulo5 ["Módulo Accesos: Reenvío de Credenciales (SOP-SR-03)"]
        %% Actores
        Actor304(("Proveedor"))
        Actor305(("Área de Compras"))
        Actor306(("Soporte a Proveedores"))
        
        %% Casos de Uso
        UC284(["Solicitar reenvío de credenciales"])
        UC285(["Completar Excel de validación"])
        UC286(["Solicitar actualización de Encargado HUB"])
        UC287(["Confirmar acceso exitoso al portal"])
        UC288(["Evaluar solicitud y enviar Excel"])
        UC289(["Validar información y existencia en BD"])
        UC290(["Derivar solicitud a Soporte TI"])
        UC291(["Orientar sobre canal formal de solicitud"])
        UC292(["Gestionar ticket de reenvío en GLPI"])
        UC293(["Validar vigencia de Encargado HUB"])
        UC294(["Reenviar credenciales al correo autorizado"])
        UC295(["Documentar y cerrar ticket"])

        %% Relaciones
        Actor304 --> UC284
        Actor304 --> UC285
        Actor304 --> UC286
        Actor304 --> UC287
        Actor305 --> UC288
        Actor305 --> UC289
        Actor305 --> UC290
        Actor306 --> UC291
        Actor306 --> UC292
        Actor306 --> UC293
        Actor306 --> UC294
        Actor306 --> UC295
        UC292 -.->|"<<include>>"| UC293
        UC286 -.->|"<<extend>>"| UC293
        UC284 -.->|"Consulta informal"| UC291
        UC291 -.->|"Guía formal"| UC288
        UC288 -.->|"Solicita llenado"| UC285
        UC285 -.->|"Devuelve Excel"| UC289
        UC290 -.->|"Inicia trámite"| UC292
        UC294 -.->|"Requiere"| UC287
    end

    subgraph Modulo6 ["Módulo Accesos: Nuevas Credenciales (SOP-SR-01)"]
        %% Actores
        Actor341(("Proveedor"))
        Actor342(("Área de Compras"))
        Actor343(("Soporte a Proveedores"))
        
        %% Casos de Uso
        UC320(["Solicitar credenciales (informal / formal)"])
        UC321(["Llenar y devolver Excel de registro"])
        UC322(["Confirmar ingreso exitoso al portal"])
        UC323(["Enviar Excel de registro al proveedor"])
        UC324(["Validar relación comercial y aprobar"])
        UC325(["Derivar solicitud a Soporte TI"])
        UC326(["Orientar sobre canal oficial (correo)"])
        UC327(["Ejecutar habilitación técnica (Cuenta/BD)"])
        UC328(["Enviar credenciales a Encargado HUB"])
        UC329(["Gestionar incidente de primer acceso"])
        UC330(["Documentar y cerrar ticket en GLPI"])

        %% Relaciones
        Actor341 --> UC320
        Actor341 --> UC321
        Actor341 --> UC322
        Actor342 --> UC323
        Actor342 --> UC324
        Actor342 --> UC325
        Actor343 --> UC326
        Actor343 --> UC327
        Actor343 --> UC328
        Actor343 --> UC329
        Actor343 --> UC330
        UC327 -.->|"<<include>>"| UC328
        UC329 -.->|"<<extend>>"| UC322
        UC320 -.->|"Si es informal"| UC326
        UC320 -.->|"Si es formal"| UC323
        UC323 -.->|"Solicita llenado"| UC321
        UC321 -.->|"Devuelve Excel"| UC324
        UC324 -.->|"Autoriza"| UC325
        UC325 -.->|"Inicia creación"| UC327
        UC328 -.->|"Requiere confirmación"| UC322
        UC322 -.->|"Permite cierre"| UC330
    end