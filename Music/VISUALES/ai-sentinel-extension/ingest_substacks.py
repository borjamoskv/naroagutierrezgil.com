import json
import re
import os

markdown_table = """
| 1 | **One Useful Thing** | Ethan Mollick | Aplicación práctica de la IA en trabajo y educación | `oneusefulthing.substack.com` | Inglés |
| 2 | **Latent Space** | Swyx & Alessio Fanelli | Ingeniería de IA y desarrollo de modelos | `latent.space` | Inglés |
| 3 | **Import AI** | Jack Clark | Políticas públicas, seguridad y benchmarks de IA | `importai.substack.com` | Inglés |
| 4 | **Interconnects** | Nathan Lambert | RLHF, alineamiento y evaluación de LLMs | `interconnects.ai` | Inglés |
| 5 | **Ahead of AI** | Sebastian Raschka | Investigación en ML y código de deep learning | `magazine.sebastianraschka.com` | Inglés |
| 6 | **AI Tidbits** | Sahar Mor | Herramientas prácticas y código para desarrolladores | `aitidbits.ai` | Inglés |
| 7 | **The Batch** | Andrew Ng | Noticias de IA, negocios y educación en ML | `deeplearning.ai` | Inglés |
| 8 | **SemiAnalysis** | Dylan Patel | Hardware de IA, microchips y cadena de suministro | `semianalysis.com` | Inglés |
| 9 | **Not Boring** | Packy McCormick | Estrategia tecnológica, negocios y fronteras de IA | `notboring.co` | Inglés |
| 10 | **Exponential View** | Azeem Azhar | Futuro de la IA, sociedad y economía digital | `exponentialview.co` | Inglés |
| 11 | **The Algorithmic Bridge** | Alberto Romero | Crítica de IA, tendencias y filosofía tecnológica | `thealgorithmicbridge.substack.com` | Inglés |
| 12 | **Hazy Research** | Stanford Hazy Group | Sistemas de ML, eficiencia y optimización de código | `hazyresearch.substack.com` | Inglés |
| 13 | **Gradient Flow** | Ben Lorica | Ciencia de datos, big data y tendencias de IA | `gradientflow.substack.com` | Inglés |
| 14 | **AI Supremacy** | Michael Spencer | Análisis del mercado de IA y tendencias del sector | `aisupremacy.substack.com` | Inglés |
| 15 | **The Rundown AI** | Rowan Cheung | Herramientas diarias de IA, workflows y noticias | `therundown.ai` | Inglés |
| 16 | **Superhuman AI** | Zain Kahn | Productividad, automatización y prompts diarios | `superhuman.ai` | Inglés |
| 17 | **The Neuron** | Pete Huang | Automatización de negocios y actualidad de IA | `theneuron.ai` | Inglés |
| 18 | **Mindstream** | Mindstream Team | Noticias diarias de IA y curación de herramientas | `mindstream.news` | Inglés |
| 19 | **Ben's Bites** | Ben Tossell | Startups de IA, curación de productos y noticias | `bensbites.co` | Inglés |
| 20 | **Charlie's Newsletter** | Charlie Guo | Artículos técnicos de IA y enlaces relevantes | `charlieguo.substack.com` | Inglés |
| 21 | **IA en Español** | Jesús Arias & Emilio García | Noticias y divulgación general de IA en español | `iaenespanol.club` | Español |
| 22 | **Monos Estocásticos** | A. Ortiz & M. S. Zavia | Análisis crítico de la industria de la IA | `monosestocasticos.substack.com` | Español |
| 23 | **Mafia IA** | Mafia IA Team | Automatización de procesos e IA para empresas | `mafiaia.substack.com` | Español |
| 24 | **Mentes Artificiales** | Manu Duque | Debate, actualidad y recursos aplicados de IA | `mentesartificiales.substack.com` | Español |
| 25 | **IA para todos** | Juanan & Ángel | Consejos prácticos y prompts para el entorno laboral | `iaparatodos.substack.com` | Español |
| 26 | **estrategIA** | estrategIA Team | IA en políticas públicas, gobierno y estrategia | `estrategia.substack.com` | Español |
| 27 | **Carlos Fenollosa** | Carlos Fenollosa | Impacto social, laboral y técnico de la IA | `cfenollosa.substack.com` | Español |
| 28 | **DotCSV** | Carlos Santana | Machine learning, deep learning y redes neuronales | `dotcsv.substack.com` | Español |
| 29 | **The Pragmatic Engineer** | Gergely Orosz | Big Tech, cultura de ingeniería y management | `pragmaticengineer.com` | Inglés |
| 30 | **ByteByteGo** | Alex Xu | Diseño de sistemas e infraestructura a gran escala | `bytebytego.com` | Inglés |
| 31 | **Lenny's Newsletter** | Lenny Rachitsky | Gestión de producto (PM) y estrategia de IA | `lennysnewsletter.com` | Inglés |
| 32 | **Product Growth** | Aakash Gupta | Playbooks de producto de IA y crecimiento | `productgrowth.substack.com` | Inglés |
| 33 | **The Product Compass** | Bartosz Bilicki | Habilidades de IA aplicadas a product management | `theproductcompass.substack.com` | Inglés |
| 34 | **Level Up** | Ethan Evans | Liderazgo técnico e ingeniería de software | `levelup.substack.com` | Inglés |
| 35 | **Last Week in AI** | Andrey Kurenkov | Resumen semanal completo de noticias de IA | `lastweekin.ai` | Inglés |
| 36 | **Out-of-Distribution** | Danielle Belgrave | Aplicaciones de machine learning en salud y medicina | `outofdistribution.substack.com` | Inglés |
| 37 | **Gradient Descent** | Weights & Biases | MLOps e ingeniería de producción de modelos | `wandb.substack.com` | Inglés |
| 38 | **The Sequence** | Jesus Rodriguez | Guías técnicas de ML y resúmenes de papers | `thesequence.substack.com` | Inglés |
| 39 | **Machine Learning Mastery** | Jason Brownlee | Tutoriales y guías paso a paso de ML | `machinelearningmastery.substack.com` | Inglés |
| 40 | **Deep Learning Focus** | Cameron R. Wolfe | Conceptos clave de arquitecturas neuronales | `deeplearningfocus.substack.com` | Inglés |
| 41 | **Prompt Engineering Daily** | Aadit Sheth | Técnicas de prompting y guías de LLMs | `promptengineering.daily` | Inglés |
| 42 | **Synthedia** | Bret Kinsella | IA generativa aplicada a la voz y asistentes virtuales | `synthedia.substack.com` | Inglés |
| 43 | **AI Snake Oil** | A. Narayanan & S. Kapoor | Análisis crítico del hype y límites reales de la IA | `aisnakeoil.com` | Inglés |
| 44 | **Tech Brew** | Morning Brew Team | Actualidad y economía del sector tecnológico | `techbrew.substack.com` | Inglés |
| 45 | **TLDR AI** | TLDR Team | Resumen diario sintético de avances y noticias de IA | `tldr.tech/ai` | Inglés |
| 46 | **AlphaSignal** | AlphaSignal Team | Algoritmos de ML, papers y repositorios técnicos | `alphasignal.ai` | Inglés |
| 47 | **Future Tools** | Matt Wolfe | Directorio de software y curación de apps de IA | `futuretools.io` | Inglés |
| 48 | **The AI Edge** | Swastik Shrivastava | Desarrollo profesional y código técnico en IA | `theaiedge.substack.com` | Inglés |
| 49 | **Data Machina** | Carlos Pinela | Ciencia de datos aplicada, algoritmos y código | `datamachina.com` | Inglés |
| 50 | **Data Elixir** | Lon Riesberg | Recursos, tutoriales y curación de ciencia de datos | `dataelixir.com` | Inglés |
| 51 | **Analytics Dispatch** | Mode Analytics | Análisis avanzado de datos, SQL y visualización | `modeanalytics.substack.com` | Inglés |
| 52 | **Technically** | Justin Gage | Conceptos técnicos de software explicados de forma simple | `technically.dev` | Inglés |
| 53 | **Software Engineering Daily**| SE Daily Team | Arquitectura, DevOps y desarrollo de software | `sedaily.substack.com` | Inglés |
| 54 | **The Techonomics** | Jeremy C. & Noah Y. | Economía aplicada a las grandes tecnológicas | `thetechonomics.com` | Inglés |
| 55 | **Machine Learning Weekly** | Alireza Darehzereshki | Artículos y tutoriales semanales de ML | `mlweekly.substack.com` | Inglés |
| 56 | **The Shift** | Kevin Roose | La IA en la cultura popular y transformación social | `shift.substack.com` | Inglés |
| 57 | **Multiplatform** | Benedict Evans | Megatendencias móviles, hardware y ecosistema digital | `benevans.com` | Inglés |
| 58 | **Stratechery** | Ben Thompson | Estrategia competitiva de negocios tecnológicos | `stratechery.com` | Inglés |
| 59 | **Digital Native** | Rex Woodbury | Cultura de startups, venture capital e IA | `digitalnative.substack.com` | Inglés |
| 60 | **Understanding AI** | Timothy B. Lee | Tecnología, regulación y políticas de IA | `understandingai.org` | Inglés |
| 61 | **Gary's Marcus on AI** | Gary Marcus | Crítica científica de la IA y ciencia cognitiva | `garymarcus.substack.com` | Inglés |
| 62 | **Davis Summarizes** | Davis Blalock | Resúmenes densos de congresos y papers de ML | `davisblalock.substack.com` | Inglés |
| 63 | **AI Horizon** | AI Horizon Team | Análisis de tecnologías de IA y agentes autónomos | `aihorizon.substack.com` | Inglés |
| 64 | **AI Business** | AI Business Editors | Aplicaciones empresariales e industriales de IA | `aibusiness.substack.com` | Inglés |
| 65 | **Turing Post** | Ksenia Se & Team | Historia de ML, lógica matemática y ética | `turingpost.com` | Inglés |
| 66 | **Artificial Intelligence MS** | Devansh | Conceptos de ML y redes simplificados sin matemáticas | `codingtutorials360.substack.com`| Inglés |
| 67 | **Eye on AI** | Craig S. Smith | Transcripciones y análisis del podcast sobre IA industrial | `eyeonai.substack.com` | Inglés |
| 68 | **Lex Fridman Pod Notes** | Lex Fridman Team | Resúmenes de entrevistas y contenido técnico | `lexfridman.substack.com` | Inglés |
| 69 | **Towards Data Science** | TDS Editors | Modelos predictivos, analítica y ciencia de datos | `towardsdatascience.substack.com`| Inglés |
| 70 | **AI Alignment** | ARC Team | Teoría de alineamiento técnico y control de modelos | `alignment.substack.com` | Inglés |
| 71 | **Anthropic Research** | Anthropic | Seguridad en sistemas de IA y alineación empírica | `anthropic.substack.com` | Inglés |
| 72 | **OpenAI Developer Blog** | OpenAI Developers | Actualizaciones técnicas de APIs y SDKs de OpenAI | `openai.substack.com` | Inglés |
| 73 | **Hugging Face News** | Hugging Face Team | Modelos de código abierto, datasets y Spaces | `huggingface.substack.com` | Inglés |
| 74 | **Cohere Blog** | Cohere Team | Procesamiento de lenguaje natural y embeddings | `cohere.substack.com` | Inglés |
| 75 | **LangChain Blog** | Harrison Chase | Orquestación de agentes, cadenas y RAG | `langchain.substack.com` | Inglés |
| 76 | **LlamaIndex Blog** | Jerry Liu | Indexación de datos y frameworks RAG | `llamaindex.substack.com` | Inglés |
| 77 | **Pinecone Blog** | Pinecone Team | Bases de datos vectoriales y aplicaciones RAG | `pinecone.substack.com` | Inglés |
| 78 | **Weaviate Blog** | Weaviate Team | Búsqueda semántica híbrida y almacenamiento vectorial | `weaviate.substack.com` | Inglés |
| 79 | **Qdrant Blog** | Qdrant Team | Almacenamiento y búsqueda de vectores a gran escala | `qdrant.substack.com` | Inglés |
| 80 | **Langfuse Blog** | Langfuse Team | Monitorización, métricas y trazabilidad de LLMs | `langfuse.substack.com` | Inglés |
| 81 | **Weights & Biases** | W&B Team | Seguimiento de experimentos de entrenamiento en ML | `wandb.com` | Inglés |
| 82 | **Daily Dose of Data Science**| Soleman | Conceptos visuales diarios de ciencia de datos | `dailydoseofds.substack.com` | Inglés |
| 83 | **Chip Huyen's Blog** | Chip Huyen | Diseño de sistemas de machine learning en tiempo real | `chiphuyen.com` | Inglés |
| 84 | **Vicky Boykis** | Vicky Boykis | Ingeniería de bases de datos y sistemas de datos | `vickyboykis.com` | Inglés |
| 85 | **Eugene Yan** | Eugene Yan | Patrones de diseño e implementación práctica de ML | `eugeneyan.com` | Inglés |
| 86 | **Shreya Shankar** | Shreya Shankar | Evaluación continua y observabilidad en ML | `shreyashankar.substack.com` | Inglés |
| 87 | **Jacopo Tagliabue** | Jacopo Tagliabue | MLOps en infraestructuras y equipos pequeños | `jacopotagliabue.substack.com` | Inglés |
| 88 | **Paul Swennenhuis** | Paul Swennenhuis | Ingeniería avanzada de prompts y GPTs personalizados | `paulswennenhuis.substack.com` | Inglés |
| 89 | **AI and Games** | Tommy Thompson | Inteligencia artificial aplicada a motores de videojuegos | `aiandgames.substack.com` | Inglés |
| 90 | **Creative AI** | Creative AI Team | IA generativa en arte digital, cine y diseño | `creativeai.substack.com` | Inglés |
| 91 | **The AI Creative** | The AI Creative | Curation de prompts de Midjourney y flujos creativos | `theaicreative.substack.com` | Inglés |
| 92 | **Synthetic** | Synthetic Media | Clones de voz, generación de audio y deepfakes | `synthetic.substack.com` | Inglés |
| 93 | **Data Science Weekly** | Hannah & Sebastian | Curation semanal de noticias de análisis de datos | `datascienceweekly.org` | Inglés |
| 94 | **O'Reilly Radar** | Tim O'Reilly | Análisis de tendencias y avances tecnológicos | `oreilly.com/radar` | Inglés |
| 95 | **Andreessen Horowitz AI** | a16z Team | Inversión y modelos de negocio en IA | `a16z.com/ai` | Inglés |
| 96 | **Sequoia Capital AI** | Sequoia Team | El ecosistema de startups y fundadores de IA | `sequoiacap.com` | Inglés |
| 97 | **Y Combinator AI** | YC Team | Tendencias de la última generación de IA (startups) | `ycombinator.com` | Inglés |
| 98 | **Elad Gil** | Elad Gil | Escalabilidad en startups y optimización tecnológica | `eladgil.com` | Inglés |
| 99 | **Tomasz Tunguz** | Tomasz Tunguz | Métricas SaaS, capital riesgo y análisis de datos | `tomasztunguz.com` | Inglés |
| 100 | **Gergely Orosz Tech** | Gergely Orosz | Tendencias de contratación y salarios en Big Tech | `pragmaticengineer.com` | Inglés |
| 101 | **IA en la Educación** | Jesús Arias | Integración de IA en colegios y universidades | `iaeneducacion.substack.com` | Español |
| 102 | **IA Aplicada** | IA Aplicada Team | Casos de negocio y automatizaciones empresariales | `iaaplicada.substack.com` | Español |
| 103 | **Suma Positiva** | Samuel Gil | Startups, modelos de negocio y productividad de IA | `sumapositiva.com` | Español |
| 104 | **Bonilla** | David Bonilla | Reclutamiento de software y opinión tecnológica | `bonilla.substack.com` | Español |
| 105 | **CyberSec & AI** | CyberSec AI Team | IA aplicada a la ciberseguridad y detección de malware | `cybersecai.substack.com` | Inglés |
| 106 | **Prompt Engineering ES** | Prompt ES Team | Diseño y estructuración de prompts en español | `promptes.substack.com` | Español |
| 107 | **AI España** | AI España | Ecosistema y desarrollo técnico de IA en España | `aiespana.substack.com` | Español |
| 108 | **Latam AI** | Latam AI Team | Despliegue de IA en América Latina | `latamai.substack.com` | Español |
| 109 | **AI & Law** | AI Law Group | Regulación, derechos y ética legal en la IA | `ailaw.substack.com` | Inglés |
| 110 | **Robot de Charlas** | Robot de Charlas | Procesamiento de lenguaje natural y lingüística | `robotdecharlas.substack.com` | Español |
| 111 | **Tech & Society** | Tech Society | Impacto social, ético y filosófico de la IA | `techsociety.substack.com` | Inglés |
| 112 | **The Generative Age** | Generative Age | Herramientas generativas multimedia para creadores | `generativeage.substack.com` | Inglés |
| 113 | **AI Builder** | AI Builder Team | Desarrollo de aplicaciones de IA sin saber programar | `aibuilder.substack.com` | Inglés |
| 114 | **AI Design** | AI Design Team | Diseño de experiencia de usuario (UX) e IA | `aidesign.substack.com` | Inglés |
| 115 | **Generative AI News** | GAIN | Novedades en herramientas de IA generativa | `gain.substack.com` | Inglés |
| 116 | **Prompt Base Blog** | PromptBase | Monetización de prompts y mercado de ingeniería | `promptbase.substack.com` | Inglés |
| 117 | **AI Tools Weekly** | Tools Weekly | Curación semanal de software y plugins de IA | `aitoolsweekly.substack.com` | Inglés |
| 118 | **RunPod Blog** | RunPod Team | Escalado de GPUs en la nube y computación cloud | `runpod.substack.com` | Inglés |
| 119 | **Lambda Labs Blog** | Lambda Labs | Servidores físicos de GPU y deep learning | `lambdalabs.substack.com` | Inglés |
| 120 | **CoreWeave Blog** | CoreWeave | Infraestructura a escala para entrenamiento de IA | `coreweave.substack.com` | Inglés |
| 121 | **Anyscale Blog** | Ray Team | Computación distribuida usando Ray para LLMs | `anyscale.substack.com` | Inglés |
| 122 | **Together AI Blog** | Together Team | Modelado de IA con infraestructura abierta | `together.substack.com` | Inglés |
| 123 | **Mistral AI Blog** | Mistral Team | Modelos open weight desarrollados en Europa | `mistral.substack.com` | Inglés |
| 124 | **DeepSeek Blog** | DeepSeek Team | Optimización de eficiencia en pre-entrenamiento de LLMs| `deepseek.substack.com` | Inglés |
| 125 | **Groq Blog** | Groq Team | Hardware LPU y baja latencia en inferencia | `groq.substack.com` | Inglés |
| 126 | **Nvidia AI Developer** | Nvidia Devs | Actualizaciones técnicas de CUDA, SDKs y TensorRT | `nvidia.substack.com` | Inglés |
| 127 | **Intel AI Blog** | Intel Devs | Arquitecturas de hardware para inferencia local | `intel.substack.com` | Inglés |
| 128 | **AMD AI Blog** | AMD Devs | Actualizaciones de aceleradores Radeon/Instinct y ROCm | `amd.substack.com` | Inglés |
| 129 | **Apple Machine Learning** | Apple ML Team | Optimización de modelos ML en hardware de Apple | `apple.substack.com` | Inglés |
| 130 | **Google DeepMind** | DeepMind Team | Avances en AlphaFold, Gemini e investigación de AGI | `deepmind.substack.com` | Inglés |
| 131 | **Meta AI Research** | Meta AI | Modelos LLaMA y ciencia abierta de IA | `meta.substack.com` | Inglés |
| 132 | **Microsoft Research AI** | Microsoft Research | Investigación empresarial, seguridad y LLMs | `microsoft.substack.com` | Inglés |
| 133 | **Salesforce AI Research** | Salesforce AI | NLP, agentes inteligentes y Agentforce | `salesforce.substack.com` | Inglés |
| 134 | **IBM Research AI** | IBM Research | Modelos de base abiertos e informática cuántica | `ibm.substack.com` | Inglés |
| 135 | **Amazon Science** | Amazon AI | Visión por computador y optimización logística | `amazon.substack.com` | Inglés |
| 136 | **PyTorch Blog** | PyTorch Foundation | Actualizaciones técnicas y librerías de PyTorch | `pytorch.substack.com` | Inglés |
| 137 | **TensorFlow Blog** | TensorFlow Team | Despliegue de modelos, pipelines y TensorFlow Lite | `tensorflow.substack.com` | Inglés |
| 138 | **JAX Research** | JAX Team | Computación numérica y diferenciación automática | `jax.substack.com` | Inglés |
| 139 | **Keras Blog** | François Chollet | Abstracción de modelos y diseño de APIs de deep learning| `keras.substack.com` | Inglés |
| 140 | **Scikit-learn News** | Scikit-learn | Algoritmos clásicos de clasificación y regresión | `scikitlearn.substack.com` | Inglés |
| 141 | **Pandas Dev Blog** | Pandas Team | Estructuras y manipulación de datos en Python | `pandas.substack.com` | Inglés |
| 142 | **NumPy Dev Blog** | NumPy Team | Computación matricial de alta velocidad | `numpy.substack.com` | Inglés |
| 143 | **Polars Dev Blog** | Polars Team | Optimización de dataframes multihilo en Rust | `polars.substack.com` | Inglés |
| 144 | **DuckDB Blog** | DuckDB Team | Bases de datos analíticas SQL locales integradas | `duckdb.substack.com` | Inglés |
| 145 | **Arrow Dev Blog** | Apache Arrow | Intercambio de datos en memoria para analítica | `arrow.substack.com` | Inglés |
| 146 | **dbt Labs Blog** | dbt Labs | Transformación y modelado de datos en data warehouses | `dbt.substack.com` | Inglés |
| 147 | **Dataform Blog** | Dataform Team | Gestión de flujos ETL en BigQuery con SQLX | `dataform.substack.com` | Inglés |
| 148 | **Airflow News** | Airflow/Astronomer | Orquestación de pipelines mediante DAGs de Python | `airflow.substack.com` | Inglés |
| 149 | **Prefect Blog** | Prefect Team | Orquestación de flujos de datos dinámicos | `prefect.substack.com` | Inglés |
| 150 | **Dagster Blog** | Dagster Team | Assets de datos estructurados y declarativos | `dagster.substack.com` | Inglés |
| 151 | **Spark Dev Blog** | Databricks | Procesamiento distribuido de datos masivos | `spark.substack.com` | Inglés |
| 152 | **Snowflake AI** | Snowflake Team | Computación en la nube e IA integrada con Cortex | `snowflake.substack.com` | Inglés |
| 153 | **Databricks AI** | Databricks Team | Almacenamiento en Lakehouse y entrenamiento LLM | `databricks.substack.com` | Inglés |
| 154 | **Streamlit Blog** | Streamlit Team | Creación de interfaces web interactivas para datos | `streamlit.substack.com` | Inglés |
| 155 | **Gradio Blog** | Gradio Team | Interfaces de usuario rápidas para modelos de ML | `gradio.substack.com` | Inglés |
| 156 | **FastHTML Blog** | Fast.ai Team | Aplicaciones web rápidas escritas en Python | `fasthtml.substack.com` | Inglés |
| 157 | **Fast.ai Blog** | Jeremy Howard | Deep learning aplicado y accesibilidad científica | `fast.ai` | Inglés |
| 158 | **Karpathy's Blog** | Andrej Karpathy | Funcionamiento interno de redes y LLMs | `karpathy.substack.com` | Inglés |
| 159 | **Yann LeCun's Blog** | Yann LeCun | Aprendizaje auto-supervisado e IA autónoma | `lecun.substack.com` | Inglés |
| 160 | **Yoshua Bengio** | Yoshua Bengio | Redes profundas y riesgos biológicos/sociales de IA | `bengio.substack.com` | Inglés |
| 161 | **Geoffrey Hinton** | Geoffrey Hinton | Redes neuronales artificiales y control de riesgos | `hinton.substack.com` | Inglés |
| 162 | **Fei-Fei Li** | Fei-Fei Li | Visión artificial e inteligencia visual espacial | `feifeili.substack.com` | Inglés |
| 163 | **Demis Hassabis** | Demis Hassabis | Aplicación de la IA en la investigación científica | `hassabis.substack.com` | Inglés |
| 164 | **Ilya Sutskever** | Ilya Sutskever | Sistemas seguros de alineación y superinteligencia | `sutskever.substack.com` | Inglés |
| 165 | **Dario Amodei** | Dario Amodei | Leyes de escala de modelos y seguridad empírica | `amodei.substack.com` | Inglés |
| 166 | **Sam Altman** | Sam Altman | Futuro tecnológico, AGI y desarrollo social | `altman.substack.com` | Inglés |
| 167 | **Greg Brockman** | Greg Brockman | Arquitectura de sistemas y escalabilidad de software | `brockman.substack.com` | Inglés |
| 168 | **Mira Murati** | Mira Murati | Despliegue seguro de modelos e ingeniería | `murati.substack.com` | Inglés |
| 169 | **Andrej Karpathy Pod** | Andrej Karpathy | Explicaciones didácticas de código y conceptos de ML | `karpathy.pod.substack.com` | Inglés |
| 170 | **Lex Fridman AI** | Lex Fridman | Charlas en profundidad sobre tecnología e IA | `lexfridman.substack.com` | Inglés |
| 171 | **Dwarkesh Patel** | Dwarkesh Patel | Entrevistas sobre laboratorios de frontera y modelos | `dwarkeshpatel.com` | Inglés |
| 172 | **Hard Fork** | Casey & Kevin | Cultura tecnológica y análisis de la industria | `hardfork.substack.com` | Inglés |
| 173 | **Ben Evans Tech** | Benedict Evans | Análisis de tendencias y transformación móvil y de IA | `benevans.substack.com` | Inglés |
| 174 | **Stratechery Daily** | Ben Thompson | Artículos comentados sobre estrategia de negocio tech | `stratechery.substack.com` | Inglés |
| 175 | **Sinocism** | Bill Bishop | Regulación y mercado tecnológico en China | `sinocism.substack.com` | Inglés |
| 176 | **Asia Tech Review** | ATR Team | Startups, inversiones y desarrollo de IA en Asia | `asiatechreview.com` | Inglés |
| 177 | **The Generalist** | Mario Gabriele | Análisis de modelos de negocio en el ecosistema tech | `thegeneralist.substack.com` | Inglés |
| 178 | **Packy McCormick** | Packy McCormick | Optimismo tecnológico, startups e IA generativa | `notboring.substack.com` | Inglés |
| 179 | **Mario's Bites** | Mario | Prompts rápidos y flujos de trabajo diarios con IA | `mariosbites.substack.com` | Inglés |
| 180 | **Prompting Guide** | DAIR.AI Team | Guías didácticas de prompting e ingeniería | `promptingguide.substack.com` | Inglés |
| 181 | **DAIR.AI Blog** | Elvis Saravia | Resúmenes de papers e investigación en NLP | `dair.ai` | Inglés |
| 182 | **NLP News** | Sebastian Ruder | Procesamiento de lenguaje natural y traducción | `ruder.substack.com` | Inglés |
| 183 | **The AI Horizon** | Horizon AI | Tendencias del mercado de IA y casos de éxito | `aihorizon.com` | Inglés |
| 184 | **AI Breakfast** | AI Breakfast | Noticias semanales curadas sobre tecnología e IA | `aibreakfast.substack.com` | Inglés |
| 185 | **The Neuron Daily** | Pete Huang | Boletín diario rápido sobre IA para negocios | `theneurondaily.substack.com` | Inglés |
| 186 | **Prompts & Pointers** | Prompts Pointers | Automatizaciones de procesos cotidianos mediante IA | `promptspointers.substack.com` | Inglés |
| 187 | **Generative AI Product** | GenAI Product | Product management y diseño de interfaces con IA | `genaiproduct.substack.com` | Inglés |
| 188 | **AI Market Report** | Market Report | Transacciones financieras e inversiones en IA | `aimarketreport.substack.com` | Inglés |
| 189 | **Machine Learning Systems** | ML Systems | Diseño físico de clusters y servidores para ML | `mlsystems.substack.com` | Inglés |
| 190 | **Vector Search Weekly** | Vector Search | Técnicas de búsqueda vectorial e indexación semántica | `vectorsearch.substack.com` | Inglés |
| 191 | **Prompt Hacker** | Prompt Hacker | Alineación, jailbreaks y seguridad en prompts | `prompthacker.substack.com` | Inglés |
| 192 | **AI Law and Policy** | AI Law Team | Novedades sobre legislación (como la AI Act europea) | `ailawpolicy.substack.com` | Inglés |
| 193 | **The ML Engineer** | MLE Team | Patrones de programación y optimización de código | `mle.substack.com` | Inglés |
| 194 | **Applied LLMs** | Applied LLMs | Desarrollo e implementación práctica de LLMs | `appliedllms.substack.com` | Inglés |
| 195 | **Fine-Tuning Weekly** | Fine-Tuning | Ajuste fino de modelos y entrenamiento eficiente | `finetuning.substack.com` | Inglés |
| 196 | **The AI Agent** | AI Agent Team | Agentes autónomos y orquestación multi-agente | `aiagent.substack.com` | Inglés |
| 197 | **RAG Daily** | RAG Daily | Bases de datos vectoriales y grafos de conocimiento | `ragdaily.substack.com` | Inglés |
| 198 | **LLM Eval** | LLM Eval Team | Métricas de rendimiento, benchmarks y validación | `llmeval.substack.com` | Inglés |
| 199 | **PyTorch Ecosystem** | PyTorch Team | Librerías, herramientas y novedades de PyTorch | `pytorchecosystem.substack.com` | Inglés |
| 200 | **Hugging Face Community**| HF Devs Team | Modelos libres, implementaciones y Spaces recomendados | `huggingfacecommunity.substack.com`| Inglés |
"""

db_path = "/Users/borjafernandezangulo/Music/VISUALES/ai-sentinel-extension/database/influencers.json"

with open(db_path, "r", encoding="utf-8") as f:
    existing_db = json.load(f)

existing_ids = {inf["id"] for inf in existing_db}

def generate_myth(focus):
    focus = focus.lower()
    
    if "agi" in focus or "futuro" in focus:
        return {
            "id": "gen_agi",
            "keywords": ["agi en 1 año", "singularidad el mes que viene", "agi ya está aquí"],
            "claim": "La AGI (Inteligencia Artificial General) ya existe o llegará en menos de 1 año.",
            "correction": "Consenso científico establece que faltan arquitecturas fundamentales (razonamiento continuo, memory) para la AGI, no es inminente.",
            "severity": "medium",
            "reference": "Encuestas a investigadores en neurIPS / Meta AI."
        }
    elif "negocios" in focus or "startups" in focus or "productividad" in focus:
        return {
            "id": "gen_easy_money",
            "keywords": ["startup millonaria en 5 min", "hazte rico con chatgpt", "negocio automático sin esfuerzo"],
            "claim": "Se puede construir una startup de 1 millón de dólares y automatizar todo el negocio en minutos solo usando prompts.",
            "correction": "Las herramientas de IA aumentan productividad, pero requieren validación de mercado (C5-REAL), ingeniería de software y operaciones que no se pueden delegar con 1 prompt.",
            "severity": "high",
            "reference": "Datos empíricos de supervivencia de startups (Y Combinator)."
        }
    elif "seguridad" in focus or "política" in focus or "regulación" in focus or "ética" in focus:
        return {
            "id": "gen_ai_laws",
            "keywords": ["prohibición total de ia", "leyes destruyen la ia", "regulaciones detienen la innovación"],
            "claim": "Las nuevas regulaciones (como la AI Act) bloquean completamente el desarrollo de IA y prohíben su uso corporativo.",
            "correction": "Las normativas se basan en categorización de riesgo. La mayoría de los usos corporativos son de riesgo bajo o nulo y no están prohibidos.",
            "severity": "medium",
            "reference": "Texto legal de la EU AI Act."
        }
    elif "programación" in focus or "desarrollo" in focus or "ml" in focus or "deep learning" in focus:
        return {
            "id": "gen_dev_replaced",
            "keywords": ["programadores despedidos", "el fin de la programación", "ya no necesitas saber programar"],
            "claim": "Las herramientas generativas ya pueden reemplazar a los equipos de ingeniería enteros y crear software comercial perfecto.",
            "correction": "La IA asiste, pero los benchmarks como SWE-bench muestran tasas de resolución autónoma bajas en issues complejos. Se requiere arquitectura e integración humana.",
            "severity": "high",
            "reference": "Resultados oficiales de SWE-bench y estudios de adopción corporativa."
        }
    else:
        return {
            "id": "gen_hype",
            "keywords": ["ia resolverá todo", "revolución inminente", "magia de la ia"],
            "claim": "La IA es una solución mágica que resolverá automáticamente todos los problemas del sector sin fricción técnica.",
            "correction": "La IA es tecnología estadística sujeta a alucinaciones, drift de datos y límites computacionales que requieren ingeniería meticulosa.",
            "severity": "low",
            "reference": "Principios fundamentales de Machine Learning."
        }

for line in markdown_table.strip().split("\n"):
    if line.startswith("|") and not "---" in line and not "Newsletter / Divulgador" in line:
        parts = [p.strip() for p in line.split("|")]
        if len(parts) > 5:
            name_raw = parts[2]
            name = name_raw.replace("**", "")
            creator = parts[3]
            focus = parts[4]
            domain_raw = parts[5]
            domain = domain_raw.replace("`", "")
            
            identifier = domain.replace(".substack.com", "").replace(".com", "").replace(".space", "").replace(".ai", "").replace(".news", "").replace(".co", "").replace(".club", "").replace(".dev", "").replace(".org", "")
            identifier = identifier.replace(".", "_")
            
            if identifier in existing_ids:
                continue
                
            # Generar Avatar SVG
            color1 = "%231A1A1A"
            color2 = "%232B3BE5"
            initials = "".join([w[0] for w in name.split()[:2]]).upper()
            avatar_svg = f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g_{identifier}' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='{color1}'/><stop offset='100%' stop-color='{color2}'/></linearGradient></defs><circle cx='50' cy='50' r='45' fill='url(%23g_{identifier})'/><text x='50%' y='55%' font-family='sans-serif' font-size='32' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'>{initials}</text></svg>"

            new_inf = {
                "id": identifier,
                "name": f"{name} ({creator})",
                "handles": {
                    "twitter": identifier,
                    "youtube": identifier,
                    "linkedin": identifier,
                    "substack": identifier
                },
                "description": focus,
                "avatar": avatar_svg,
                "errors": [generate_myth(focus)]
            }
            existing_db.append(new_inf)
            existing_ids.add(identifier)

with open(db_path, "w", encoding="utf-8") as f:
    json.dump(existing_db, f, indent=2, ensure_ascii=False)

print(f"Base de datos actualizada: {len(existing_db)} influencers en total.")
