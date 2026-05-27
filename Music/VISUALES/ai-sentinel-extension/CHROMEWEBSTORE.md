# Chrome Web Store Manifest & Pre-Publish Assets

This document is the single source of truth for the Chrome Web Store Developer Console listing details, permissions justifications, and privacy disclosures for the **AI Sentinel** extension.

*Last Updated: 2026-05-28*
*Target Release Version: 1.0.0*

---

## 1. Store Listing Copy

### Extension Name
`AI Sentinel - Auditoría de Errores de IA` (Max 45 chars)

### Short Description
`Audita y resalta en rojo afirmaciones erróneas y mitos de influencers de Inteligencia Artificial en español.` (Max 150 chars)

### Detailed Description (Markdown formatting stripped on upload)
```text
AI Sentinel es una extensión soberana diseñada para combatir el hype y la desinformación técnica en torno a la Inteligencia Artificial en el ecosistema hispanohablante.

La extensión analiza de forma 100% local tu actividad en redes sociales (como Twitter/X, YouTube y LinkedIn) y marca con un borde rojo parpadeante e inline audit badges (insignias de auditoría) cualquier afirmación que coincida con mitos conocidos o exageraciones técnicas de divulgadores e influencers de IA populares.

CARACTERÍSTICAS PRINCIPALES:
- Base de datos local precargada con influencers destacados (DotCSV, Carlos Fenollosa, Pau Garcia-Milà, MoureDev, Midudev).
- Detección en tiempo real de claims erróneos o clickbait técnico.
- Tooltips flotantes interactivos que explican de forma científica la corrección y proporcionan referencias o papers (ej. Yann LeCun, OpenAI papers, directrices de ingeniería de software).
- Consola de reportes interactiva en la que puedes añadir tus propios creadores o registrar nuevos mitos directamente en tu almacenamiento local.
- Panel de control de estilo Industrial Noir 2026 para activar o desactivar el detector con un solo switch y ver tus estadísticas acumuladas.

VIVE EN C5-REAL:
Todo el procesamiento de texto y almacenamiento de datos se realiza de forma local en tu navegador (chrome.storage.local). Ninguna palabra que leas, historial de navegación o dato personal es transmitido o subido a servidores externos.
```

---

## 2. Permissions Justifications

Every permission requested in `manifest.json` must have a corresponding justification for the review team:

| Permission / Host | Type | Purpose & User Benefit |
| :--- | :--- | :--- |
| `storage` | API Permission | Para guardar la configuración de encendido/apagado, el conteo total de auditorías realizadas y las adiciones de mitos que el usuario registre en su base de datos local. |
| `*://*.twitter.com/*` | Host Permission | Requerido para inyectar el content script que audita los tweets publicados por influencers de IA en español. |
| `*://*.x.com/*` | Host Permission | Requerido para inyectar el content script que audita los tweets publicados por influencers de IA en español en la nueva URL. |
| `*://*.youtube.com/*` | Host Permission | Requerido para verificar si el video que está visualizando el usuario pertenece a un canal de influencer en la base de datos y auditar su título y descripción. |
| `*://*.linkedin.com/*` | Host Permission | Requerido para auditar las publicaciones profesionales (feed updates) hechas por los divulgadores registrados. |

---

## 3. Privacy & Data Use Disclosures

### Data Collection Declarations
- [x] **No data collected**: The extension does not collect, transmit, or share any user data.
- [x] **Local Processing**: Text scanning and database operations are executed strictly within the extension's execution context in the user's browser sandbox.

### Privacy Policy Draft
```text
PÓLIZA DE PRIVACIDAD DE AI SENTINEL (2026)

Esta extensión de navegador respeta plenamente la privacidad de tu navegación. 

1. Datos recopilados: AI Sentinel NO recopila, almacena ni transmite ningún tipo de información personal, historial de navegación, contraseñas ni datos del sistema.
2. Procesamiento local: Todas las lecturas del DOM y escaneos de publicaciones en redes sociales se realizan localmente en el hilo de ejecución de la pestaña abierta del usuario.
3. Almacenamiento local: Las configuraciones y nuevas adiciones a la base de datos se guardan estrictamente en el espacio de almacenamiento local aislado de Chrome (chrome.storage.local).
4. Comunicaciones de red: La extensión no realiza ninguna petición HTTP/fetch a servidores externos. Toda la base de datos es estática y actualizable por el propio usuario localmente.
```

---

## 4. Store Assets Checklist

- [x] **Icons**:
  - `icons/icon-16.png` (16×16px) - Generated.
  - `icons/icon-48.png` (48×48px) - Generated.
  - `icons/icon-128.png` (128×128px) - Generated.
- [ ] **Screenshots**:
  - Requires 1-5 screenshots of dimensions `1280×800` or `640×400`. (User must capture these directly from Chrome unpacked extension view).
- [ ] **Promo Tiles** (Optional):
  - Large tile: `440×280` px.

---

## 5. Version History

### Version 1.0.0
- **Release Date**: 2026-05-28
- **Developer**: Borja Moskv
- **Status**: Ready for ZIP packaging and submission.
- **Features**: Initial release featuring local database of 5 Spanish AI influencers, regex-based keyword detection on X/YouTube/LinkedIn, interactive tooltip injection, and custom popup control dashboard.
