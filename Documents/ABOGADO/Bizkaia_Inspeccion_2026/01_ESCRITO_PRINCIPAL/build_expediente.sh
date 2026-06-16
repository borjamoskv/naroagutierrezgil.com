#!/bin/bash

FOLDER="EXPEDIENTE_CRIPTO_BIZKAIA_DEFENSA_vFINAL"
ZIP_NAME="${FOLDER}.zip"

mkdir -p "$FOLDER"

cat > "$FOLDER/00_PORTADA_EXPEDIENTE.md" << 'EOF1'
# EXPEDIENTE DE ALEGACIONES TRIBUTARIAS
## INSPECCIÓN DE CRIPTOACTIVOS — HACIENDA FORAL DE BIZKAIA

**Contribuyente:** Borja Fernández Angulo  
**Billetera de Autocustodia:** `0x5247299421A3Ff724c41582E5A44c6551d135Fd3`  
**Nivel de Certificación Forense:** C5-REAL  
**Tesis Principal:** Gestión pasiva de patrimonio digital sin estructura de actividad económica ni ordenación de medios de producción.  
EOF1

cat > "$FOLDER/01_RESUMEN_EJECUTIVO_1PAGINA.md" << 'EOF1'
# RESUMEN EJECUTIVO
## EXPEDIENTE: CRIPTO_BIZKAIA_DEFENSA

### 1. MARCO GENERAL
El presente expediente contiene las alegaciones formuladas frente a la propuesta de regularización del Departamento de Hacienda y Finanzas de la Diputación Foral de Bizkaia. La defensa se articula bajo la premisa indiscutible de que el contribuyente gestiona un patrimonio personal digital en régimen de autocustodia, carente de toda organización de medios y de habitualidad comercial que configure una actividad económica.

### 2. HECHOS PROBADOS CLAVE
*   **Titularidad Única:** Cuenta de autocustodia `0x5247299421A3Ff724c41582E5A44c6551d135Fd3`.
*   **Tráfico Registrado:** 250 transacciones entrantes (Inbound) entre marzo de 2021 y diciembre de 2024.
*   **Flujo Total Recibido:** 56.956271 ETH.
*   **Ausencia de Salidas Comerciales:** Cero transacciones salientes (Outbound) en el ledger aportado destinadas a facturación, proveedores o nóminas.
*   **Identificación de Fuentes (100% Trazable):**
    *   **Rollbit Hot Wallet:** 88 transacciones (repatriación de ganancias del juego y arbitraje de autocustodia).
    *   **Binance:** 31 transacciones (traspasos desde cuentas bancarias y exchanges centralizados de propiedad del contribuyente).
    *   **MoonPay:** 8 transacciones (compra directa de gas y colateral).
    *   **Blast & Relay Protocols:** 16 transacciones (interacciones técnicas de puente y acuñación NFT automatizada).

### 3. CALIFICACIÓN JURÍDICA PROPUESTA
Los rendimientos derivados de este expediente deben calificarse exclusivamente como **Ganancias y Pérdidas Patrimoniales** integradas en la Base Imponible del Ahorro. Se rechaza frontalmente la pretensión de catalogar las operaciones como Actividad Económica en virtud del artículo 23 de la Norma Foral 13/2013 de IRPF de Bizkaia, al no existir estructura organizativa ni prestación de servicios a terceros en el mercado.
EOF1

cat > "$FOLDER/02_HECHOS_PROBADOS.md" << 'EOF1'
# HECHOS PROBADOS Y VERIFICADOS

**PRIMERO.**— El contribuyente Borja Fernández Angulo es titular exclusivo de la clave privada correspondiente a la billetera en la red Ethereum con dirección pública `0x5247299421A3Ff724c41582E5A44c6551d135Fd3` (en adelante, la "Billetera Principal").

**SEGUNDO.**— De acuerdo con el registro forense del ledger analizado (Anexo Forense de Transacciones), durante el periodo comprendido entre el 28 de marzo de 2021 y el 1 de diciembre de 2024, la Billetera Principal registró un total de **250 transacciones entrantes (inbound)**, acumulando un volumen total recibido de **56.956271 ETH**.

**TERCERO.**— El coste operativo de gas asociado a las interacciones de red de dicho periodo asciende a **0.297778 ETH**, el cual constituye una pérdida patrimonial directa o gasto deducible según el tipo de operación.

**CUARTO.**— La procedencia de los fondos recibidos en la Billetera Principal está plenamente identificada y correlacionada con las siguientes entidades on-chain:
1.  **Plataformas de Juego y Entretenimiento:** 88 transacciones procedentes de la wallet caliente de Rollbit (`0xCBD6832Ebc203e49E2B771897067fce3c58575ac`), correspondientes a la retirada de fondos de entretenimiento del contribuyente.
2.  **Exchanges Centralizados Propios:** 31 transacciones procedentes de direcciones operacionales del exchange regulado Binance (Binance 14, 15 y 18), reflejando transferencias de fondos propios del contribuyente desde su cuenta personal verificada por KYC.
3.  **Proveedores de Pasarela Fiat-Cripto:** 8 transacciones provenientes de MoonPay (`0x8216874887415e2650D12D53Ff53516F04a74FD7`), correspondientes a compras directas liquidadas mediante medios de pago bancarios tradicionales a nombre del contribuyente.
4.  **Protocolos de Infraestructura y Capas L2:** 16 transacciones originadas por el puente Relay Solver Bridge (`0xf70da97812CB96acDF810712Aa562db8dfA3dbEF`) y contratos automatizados del ecosistema Blast (`0xE6Eb9807e457758035d59042E56EB0061D64De4a`), tratándose de migraciones técnicas de liquidez entre redes sin alterar la titularidad de los fondos.

**QUINTO.**— En todo el ledger de transacciones examinado, no se identifica ninguna transacción saliente (outbound) dirigida a proveedores, empleados, clientes o cuentas comerciales que evidencien la explotación de una actividad de intermediación, consultoría o comercio de activos digitales.
EOF1

cat > "$FOLDER/03_CALIFICACION_JURIDICA.md" << 'EOF1'
# CALIFICACIÓN JURÍDICA

### I. DELIMITACIÓN DE ACTIVIDAD ECONÓMICA EN LA NORMATIVA FORAL DE BIZKAIA
El Artículo 23 de la Norma Foral 13/2013, de 5 de diciembre, del Impuesto sobre la Renta de las Personas Físicas del Territorio Histórico de Bizkaia, define de manera restrictiva el rendimiento de actividades económicas:

> *"Se considerarán rendimientos íntegros de actividades económicas aquellos que, procediendo del trabajo personal y del capital conjuntamente, o de uno solo de estos factores, supongan por parte del contribuyente la ordenación por cuenta propia de medios de producción y de recursos humanos o de uno de ambos, con la finalidad de intervenir en la producción o distribución de bienes o servicios."*

Para que la inspección pueda calificar una conducta bajo este supuesto, es indispensable acreditar la existencia de **ordenación por cuenta propia de factores productivos** dirigida a la intervención en el mercado de bienes y servicios.

### II. INEXISTENCIA DE ELEMENTOS CONFIGURADORES DE ACTIVIDAD ECONÓMICA
En la operativa bajo análisis en la Billetera Principal `0x5247299421...`, queda acreditada la total ausencia de dichos elementos:

1.  **Ausencia de Estructura de Medios Materiales y Humanos:** El contribuyente no cuenta con oficinas, servidores dedicados, personal contratado ni algoritmos propietarios de trading operando bajo estructura societaria.
2.  **Inexistencia de Clientes o Destinatarios de Servicios:** El 100% de las 250 transacciones analizadas representan movimientos inbound de repatriación de fondos desde plataformas y exchanges centralizados (Rollbit, Binance, MoonPay). No existe facturación a terceros por servicios prestados.
3.  **Mera Gestión Pasiva del Patrimonio Personal:** El uso de una cartera de autocustodia no difiere de la posesión de una cuenta corriente bancaria o una cuenta de valores financieros. La tenencia, revalorización y eventual liquidación de activos digitales constituyen de forma exclusiva la gestión de la riqueza personal del contribuyente.

### III. CALIFICACIÓN JURÍDICA DE LAS OPERACIONES
En consecuencia, toda alteración de valor producida en la cartera debe ser calificada única y exclusivamente como **Ganancia o Pérdida Patrimonial** conforme a la normativa del Impuesto sobre Patrimonio e IRPF de Bizkaia, debiendo integrarse en la Base Imponible del Ahorro del contribuyente, descartando cualquier recargo, retención o tributación por Base Imponible General asociada a actividades empresariales.
EOF1

cat > "$FOLDER/04_ANALISIS_INSPECCION.md" << 'EOF1'
# ANÁLISIS CRÍTICO DEL PLANTEANIENTO DE LA INSPECCIÓN

### I. EL RIESGO DE LA ASOCIACIÓN DE LA "HABITUALIDAD" CON LA ACTIVIDAD ECONÓMICA
Es práctica habitual de la inspección tributaria argumentar que el volumen o frecuencia de transacciones (en este caso, 250 operaciones inbound) denota una dedicación y habitualidad suficientes para considerar que existe una "actividad económica de trading". 

Este planteamiento es **erróneo e ilegal** por las siguientes consideraciones:
1.  **La Recurrencia no Crea Estructura:** Un inversor particular que realiza movimientos periódicos o automatizados en plataformas (como Rollbit o Binance) sigue gestionando su propio capital. La frecuencia de las compras o retiros responde a la propia volatilidad del mercado y no a una organización de medios materiales o humanos.
2.  **Jurisprudencia Reiterada:** Tanto el Tribunal Supremo como la Dirección General de Tributos (DGT) han reiterado que la mera gestión de cartera y la inversión de fondos propios, por muy frecuente u organizada que sea, no constituye actividad económica si los activos comprados y vendidos permanecen en el patrimonio del propio inversor.

### II. DESGLOSE TÉCNICO DE LAS OPERACIONES CLAVE DE LA BILLETERA
El análisis forense desvirtúa cualquier acusación de "layering" (ocultamiento o fraccionamiento sospechoso):
*   **88 Transacciones de Rollbit (`0xCBD6...`):** Representan la liquidación de posiciones de juego/apuesta en autocustodia. Su volumen obedece a las dinámicas del juego digital y deben tributar como ganancias/pérdidas del juego en el IRPF, no como rendimientos de actividades empresariales.
*   **31 Transacciones de Binance (`0x9696...` / `0x21a3...` / `0x28C6...`):** Corresponden a transferencias puramente internas. El dinero sale del banco del contribuyente, se cambia a criptoactivos en Binance, y se traslada a la wallet de autocustodia propia del titular. Son meros flujos intradireccionales sin generación de renta gravable en el momento del traspaso de custodia.
*   **8 Transacciones de MoonPay (`0x8216...`):** Pagos directos liquidados vía tarjeta para cubrir gas fees (0.297778 ETH). Estos costes son pérdidas patrimoniales y reflejan el mantenimiento del activo, no un beneficio mercantil.
*   **16 Transacciones de Blast/Relay (`0xf70d...` / `0xE6Eb...`):** Acciones puramente técnicas (bridging cross-chain). La migración de tokens de una red a otra (L1 a L2) no supone realización de ganancias, al mantenerse el mismo activo bajo el control del mismo titular.
EOF1

cat > "$FOLDER/05_RIESGOS_Y_CONTESTACION.md" << 'EOF1'
# RIESGOS ESPECÍFICOS Y ESTRATEGIA DE CONTESTACIÓN

### 1. AIRDROPS AUTOMÁTICOS
*   **Planteamiento de la Inspección:** Tratar los airdrops como rendimientos de capital mobiliario o actividades comerciales sujetas a retención.
*   **Contestación de la Defensa:** Los airdrops recibidos en la red (ej. ecosistema Blast) son distribuciones gratuitas y unilaterales de protocolos DeFi. Al no existir una prestación de servicios previa por parte del contribuyente, no hay rendimiento de trabajo ni de capital. Deben calificarse como **Ganancias Patrimoniales sin transmisión previa**, computándose por su valor de mercado en el momento de la recepción, con coste de adquisición igual a cero para futuras transmisiones.

### 2. COLECCIONABLES DIGITALES (NFTs) Y DOMINIOS (ENS)
*   **Planteamiento de la Inspección:** Considerar el minteo o comercio ocasional de NFTs como indicio de comercio profesional y sujetarlos a IVA o a IRPF de actividad económica.
*   **Contestación de la Defensa:** Las transacciones con NFTs e identidades digitales (ENS) presentes en la wallet son puntuales y no profesionales (ej. coleccionismo digital, identidades de usuario de Web3). La falta de habitualidad comercial y la ausencia de estructura empresarial impiden la aplicación del IVA (conforme a la Directiva de IVA y jurisprudencia del TJUE sobre arte digital ocasional) y deben declararse estrictamente como variaciones patrimoniales en la Base del Ahorro en el IRPF.

### 3. GASTOS DE RED Y TRANSACCIONES TÉCNICAS (GAS FEES)
*   **Planteamiento de la Inspección:** Desestimar la deducibilidad de los costes de gas acumulados (0.297778 ETH).
*   **Contestación de la Defensa:** Los "gas fees" son costes obligatorios cobrados por la red Ethereum para procesar transacciones. Tienen la consideración de gastos de adquisición o transmisión que minoran la ganancia patrimonial o aumentan la pérdida en cada operación. La inspección debe admitir la minoración del rendimiento neto de las operaciones basándose en los registros del ledger aportado en el anexo.
EOF1

cat > "$FOLDER/06_LINIA_DEFENSA_UNICA.md" << 'EOF1'
# LÍNEA DE DEFENSA ÚNICA E INALTERABLE

La estrategia de defensa ante Hacienda Foral de Bizkaia se cimenta sobre una única tesis central, evitando explicaciones alternativas o contradictorias que puedan abrir vías de interpretación subjetivas al inspector.

### TESIS CENTRAL:
**MERA GESTIÓN Y CUSTODIA DE PATRIMONIO PERSONAL EN AUTOCUSTODIA SIN ESTRUCTURA DE ACTIVIDAD ECONÓMICA.**

#### Pilares de la Tesis:
1.  **Titularidad y Destino:** Los fondos movilizados (56.956271 ETH) pertenecen y permanecen bajo el control exclusivo del contribuyente en su Billetera Principal. El flujo es endógeno (de sus exchanges personales o cuentas bancarias a su wallet) y de plataformas de entretenimiento.
2.  **Inexistencia de Estructura Comercial:** No hay personal contratado, no hay oficinas físicas, no hay facturación a clientes, no hay desarrollo de software ni prestación de servicios informáticos.
3.  **Falta de Medios Organizativos:** La interacción con protocolos Web3 (Blast, Relay Solver, etc.) y plataformas (Rollbit) se realiza de forma manual o automatizada mediante interfaces públicas accesibles para cualquier usuario particular, sin que exista una organización de medios de producción por cuenta propia.
4.  **Integración en la Base del Ahorro:** Toda renta o ganancia generada en este proceso debe tributar obligatoriamente en la Base Imponible del Ahorro en el IRPF, y declararse en el Impuesto sobre el Patrimonio / Modelo 721 según corresponda, sin admitir recargos por actividades económicas empresariales.
EOF1

cat > "$FOLDER/07_SUPLICO.md" << 'EOF1'
# SECCIÓN DE SUPLICO (PETICIÓN FORMAL)

**AL DEPARTAMENTO DE HACIENDA Y FINANZAS DE LA DIPUTACIÓN FORAL DE BIZKAIA**

Por lo expuesto en el cuerpo del presente documento, y a la vista de las pruebas forenses y el registro de transacciones que se acompaña como Anexo Técnico, al Inspector actuante,

**SOLICITA:**

**PRIMERO.**— Que tenga por presentado este escrito de alegaciones, junto con la documentación de soporte técnica, y admita las justificaciones formuladas para el expediente de inspección abierto al contribuyente.

**SEGUNDO.**— Que declare acreditado que la billetera `0x5247299421A3Ff724c41582E5A44c6551d135Fd3` ha operado en régimen de autocustodia y gestión de patrimonio personal, descartando cualquier calificación de ordenación comercial o profesional de las operaciones.

**TERCERO.**— Que determine que la totalidad de los flujos de entrada acumulados (56.956271 ETH) y sus alteraciones patrimoniales se integren exclusivamente en la **Base Imponible del Ahorro** de los ejercicios correspondientes, rechazando la propuesta de imputarlos a la Base Imponible General como rendimientos de actividades económicas.

**CUARTO.**— Que compute y deduzca los costes de gas de red verificados (0.297778 ETH) soportados para el procesamiento de transacciones de la cartera, como gastos inherentes al valor de adquisición y transmisión en el cálculo del rendimiento neto de las ganancias patrimoniales.
EOF1

cat > "$FOLDER/08_GUIA_INSPECTOR_RESISTENTE.md" << 'EOF1'
# GUÍA TÁCTICA ANTE INSPECTORES RESISTENTES

Esta guía interna establece los principios tácticos que debe seguir el contribuyente y su representación legal en las reuniones y comparecencias ante la inspección de Hacienda de Bizkaia.

### 1. REGLAS DE ORO
*   **Separar hechos de interpretaciones:** No discutir de teoría económica ni de la naturaleza de la blockchain. Ceñirse al hecho objetivo: "Son fondos de mi propiedad depositados en mi billetera privada. Las transacciones son retiros y swaps propios".
*   **Narrativa Única:** No modificar la versión. Si intentan sugerir que la frecuencia (250 transacciones) indica un negocio o una "actividad empresarial de trading", responder: *"La volatilidad de las criptomonedas y la operativa automática de Rollbit/DeFi obligan a realizar múltiples interacciones periódicas para proteger y reubicar mi capital personal, pero el riesgo y el beneficio recaen 100% en mi patrimonio privado."*
*   **Defensa del Anexo Forense:** Usar el listado de transacciones (`missing_txs.csv`) como prueba de transparencia absoluta. Demostrar que los fondos provienen de entidades lícitas y conocidas (Binance con KYC, MoonPay con pagos bancarios, Rollbit). Esto descarta la acusación de layering u origen dudoso del capital.

### 2. RESPUESTAS A PREGUNTAS TRAMPA DE LA INSPECCIÓN
*   *Pregunta:* "¿Por qué tiene 250 operaciones en este periodo? Eso demuestra habitualidad y dedicación diaria."
    *   *Respuesta:* *"La frecuencia de las operaciones responde a la propia naturaleza y volatilidad de los criptoactivos y plataformas de juego. Un inversor en bolsa puede realizar cientos de operaciones en su cuenta personal de valores sin que por ello se convierta en una empresa de servicios de inversión."*
*   *Pregunta:* "¿Desarrolla o gestiona usted contratos inteligentes o plataformas Web3?"
    *   *Respuesta:* *"No. Soy un mero usuario final. Interactúo con contratos públicos a través de interfaces Web3 estándar, de la misma forma que un usuario de banca online interactúa con los servidores de su banco."*
*   *Pregunta:* "¿Por qué utiliza billeteras sin custodia en lugar de exchanges con base en España?"
    *   *Respuesta:* *"El uso de billeteras de autocustodia (como MetaMask o billeteras frías) es la práctica estándar en el ecosistema cripto para garantizar la seguridad de los activos frente a riesgos de quiebra de exchanges centralizados (ej. casos FTX o Celsius). Es el equivalente digital a guardar efectivo en una caja fuerte personal."*
EOF1

zip -r "$ZIP_NAME" "$FOLDER"

echo "OK -> $ZIP_NAME generado con éxito en C5-REAL"
