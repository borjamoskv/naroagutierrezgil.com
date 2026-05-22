# BORJA FERNÁNDEZ ANGULO — Guion para NotebookLM Video

> **Instrucciones para NotebookLM:** Este documento es el guion maestro para generar un vídeo de presentación sobre Borja Fernández Angulo. Usa un tono directo, técnico pero accesible, con energía contenida. No uses voz corporativa genérica — esto es una persona real contando su historia desde Bizkaia, País Vasco. El ritmo debe ser: gancho fuerte → contexto → prueba técnica → reflexión personal → cierre con visión.

---

## ACTO 1 — EL GANCHO

Imagina que encuentras un bug en el código de un validador de Solana — un race condition en C que podría provocar un fork en toda la red. Eso no es ciencia ficción. Eso es lo que hice auditando Firedancer, el validador de Jump Crypto para Solana. Y eso es solo la punta del iceberg.

Me llamo Borja Fernández Angulo. Soy de Bizkaia, País Vasco. Ingeniero de software, investigador de seguridad blockchain, y constructor de herramientas de IA. Y esta es mi historia.

---

## ACTO 2 — ¿QUIÉN SOY?

No vengo de Silicon Valley. No tengo un MBA de Stanford. Vengo de la cultura industrial vasca — donde las cosas se hacen con las manos, se miden, y se entregan.

Mis tres superficies de trabajo son:

### 1. Seguridad Blockchain (Bug Bounty Hunting)
Audito smart contracts en protocolos DeFi con millones de dólares en riesgo. He encontrado vulnerabilidades reales en:

- **Firedancer** (Solana) — Race condition en código C del validador. Potencial fork de red.
- **Exactly Protocol** (Optimism, $3.3M TVL) — Bypass de delegación en VerifiedMarket. Un delegado revocado podía seguir operando vía allowance ERC4626. Verificado con Foundry PoC.
- **K2 Lending** — Close factor bypass que permite drenar ~100% del colateral en una sola transacción. Self-liquidation vector.
- **Sky Protocol** ($10M bounty pool) — Precision dust loss en SwapperCalleePsm.sol. Truncación permanente de sub-decimales sin mecanismo de barrido.
- **SSV Network** ($1M pool) — Vector DoS permanente por overflow en aritmética checked de Solidity 0.8.24.

Todo con Proof of Concept verificable. Nada simulado.

### 2. CORTEX Persist — Memoria Criptográfica para Agentes IA
He construido CORTEX Persist, una librería open-source en Python que resuelve un problema que nadie está abordando correctamente: **¿cómo pruebas qué sabía tu agente de IA cuando tomó una decisión crítica?**

- Ledger append-only con cadena SHA-256.
- Checkpoints Merkle para verificación O(1).
- Exportación de paquetes de auditoría sellados — evidencia criptográfica, no logs.
- Local-first. Sin dependencia de cloud.
- Publicado en PyPI: `pip install cortex-persist`.

El caso de uso real: si tu agente de trading ejecuta una operación de $5,000, CORTEX te da una cadena criptográfica que prueba exactamente qué contexto tenía cuando tomó esa decisión. Si alguien muta la base de datos después, la verificación falla matemáticamente.

No es logging. No es observabilidad. Es **evidencia**.

### 3. Música Electrónica — EXERGIA-Ω
Produzco música electrónica. No como hobby lateral — como la tercera pata de un trípode. La música es donde convergen la señal, el ruido y la estética. Mi proyecto artístico se llama EXERGIA-Ω, y aplico principios de procesamiento de señal y masterización espacial binaural a la producción.

---

## ACTO 3 — LA FILOSOFÍA TÉCNICA

Trabajo bajo un framework de pensamiento que llamo las **Nueve Leyes**. No es postureo — es disciplina operativa:

**Ley Bizantina (Ω₁):** Un modelo de lenguaje es un compresor generativo, no un motor de verdad. Toda salida de IA es conjetura hasta que cruza una frontera determinista de verificación. He refutado 3 "hallucinations" que otros equipos habían aceptado como válidas — en Sky, Lido y SSV — simplemente leyendo el código fuente con rigor.

**Ley Termodinámica (Ω₂):** Mido exergía (trabajo útil), no volumen de output. 100 líneas de código que encuentran un bug real valen más que 10.000 líneas de infraestructura que no produce nada.

**Ley de la Verdad (Ω₉):** Prohibido presentar simulaciones como operaciones reales. Si no hay transacción on-chain verificable, no hay dinero. Si no hay API call real, no hay extracción. Todo lo que muestro tiene nivel de realidad declarado: C5-REAL (verificable) o C4-SIMULACIÓN (local/teatro).

---

## ACTO 4 — EL ECOSISTEMA TÉCNICO

Mi stack técnico real:

- **Lenguajes:** Python, Rust, Solidity, C (auditoría de bajo nivel)
- **Blockchain:** Foundry (testing/PoC), EVM internals, validadores Solana
- **IA/ML:** Orquestación multi-agente, VSA (Vector Symbolic Architecture), embeddings locales
- **Verificación formal:** Z3 SMT solver (a través de Anvil-Lang, mi lenguaje de verificación)
- **Infraestructura:** SQLite WAL-mode, hash chains, Merkle trees, API REST/MCP
- **DevOps:** CI/CD con GitHub Actions, Vercel, Docker

He construido Anvil-Lang — un lenguaje de verificación formal que usa Z3 para demostrar matemáticamente que un smart contract tiene una vulnerabilidad. No fuzzing probabilístico — proof.

---

## ACTO 5 — LA AUTOCRÍTICA

Aquí viene lo importante. Me hice una auditoría de creencias a mí mismo y encontré esto:

- Mucho de lo que construí es infraestructura para infraestructura. La ratio metadata/acción está invertida.
- La terminología militar y termodinámica que uso a veces funciona como escudo — hace que lo mundano suene épico.
- Lo más valioso que he producido no necesitó frameworks complejos. Necesitó silencio, concentración, y un debugger.
- La velocidad es droga compartida — 20 conversaciones con IA en horas es compulsión, no productividad.

La creencia central que saqué de esa auditoría: **"Eres mejor de lo que el sistema te deja ser."** La capacidad real está en percepción → acción → registro. No al revés.

---

## ACTO 6 — LA VISIÓN

Creo que estamos viviendo la transición del software al silicio. El software es una abstracción temporal. El hardware es la verdad última.

Euskadi — el País Vasco — tiene una ventaja asimétrica en esta guerra del silicio que nadie está documentando:
- La densidad industrial más alta de España (máquina-herramienta, automoción, energía)
- Inversión en semiconductores GaN (Mondragon/Semi Zabala)
- Deducciones fiscales del 50-70% en I+D por la Hacienda Foral
- IKERLAN trabajando en federated learning y soberanía RISC-V
- European Chips Act 2.0 inminente

El gap: 20-50 ingenieros de Verilog y tooling EDA. Nadie está conectando estos puntos públicamente. Yo sí.

---

## ACTO 7 — EL CIERRE

No soy un influencer tech. No tengo un millón de seguidores. Tengo bugs verificados en protocolos con millones en riesgo, una librería publicada en PyPI que resuelve un problema real, y música que suena a lo que pienso.

Tres cosas que me definen:
1. **Verifico antes de afirmar.** Si no puedo probarlo con un PoC, no existe.
2. **Construyo en local primero.** La soberanía empieza en tu máquina.
3. **La señal importa más que el ruido.** Prefiero una línea de código que funciona a mil líneas de documentación que nadie lee.

Mi nombre es Borja Fernández Angulo. Esto es lo que hago.

---

## DATOS CLAVE PARA EL VÍDEO

| Campo | Valor |
|---|---|
| Nombre | Borja Fernández Angulo |
| Alias online | borjamoskv |
| Ubicación | Bizkaia, País Vasco, España |
| Web | borjamoskv.com |
| GitHub | github.com/borjamoskv |
| Proyecto principal | CORTEX Persist (cortexpersist.com) |
| Proyecto artístico | EXERGIA-Ω (música electrónica) |
| Especialidad | Seguridad blockchain + IA agentic |
| Plataformas bounty | Immunefi, Code4rena |
| Stack | Python, Rust, Solidity, C |
| Filosofía | "Percepción → Acción → Registro. No al revés." |

---

## TONO Y ESTILO DEL VÍDEO

- **Energía:** Contenida pero intensa. Como un ingeniero que ha encontrado algo y lo explica sin gritar.
- **Estética:** Industrial noir. Negro profundo, azul eléctrico (#2B3BE5), tipografía humanista.
- **Ritmo:** Rápido en los datos técnicos, pausado en las reflexiones personales.
- **Música de fondo sugerida:** Electrónica ambient oscura. Nada genérica — algo con textura industrial.
- **NO hacer:** No usar voz corporativa. No decir "apasionado por la tecnología". No meter buzzwords vacíos. No simplificar hasta el punto de perder sustancia.
- **SÍ hacer:** Mostrar que es alguien que se audita a sí mismo, que tiene autocrítica real, y que construye cosas verificables.
