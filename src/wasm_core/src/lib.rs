use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct GameEngine {
    width: u32,
    height: u32,
}

#[wasm_bindgen]
impl GameEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        console_error_panic_hook::set_once();
        Self { width, height }
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        // Lógica física C5-REAL 
    }

    #[wasm_bindgen]
    pub fn render(&self) {
        // Render WebGPU C5-REAL
    }
}

#[wasm_bindgen]
pub fn init_engine(width: u32, height: u32) -> GameEngine {
    GameEngine::new(width, height)
}
