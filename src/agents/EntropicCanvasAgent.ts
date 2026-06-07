import { Agent, callable } from 'agents';

// La obra no es inmutable. Registra el paso del tiempo y la fricción colectiva.
export type EntropicState = {
  globalEntropy: number;     // De 0.0 (Perfecto) a 100.0 (Fracturado)
  kintsugiActive: boolean;   // ¿Está el lienzo esperando resina de oro?
  totalRepairs: number;      // El valor del Kintsugi reside en sus cicatrices
  scars: Array<{ x: number; y: number; depth: number; timestamp: number }>;
};

export type Env = {
  RADIANCE_MEMORY: KVNamespace;
};

export class EntropicCanvasAgent extends Agent<Env, EntropicState> {
  // Estado inicial cristalizado (La Pizarra Intacta)
  initialState: EntropicState = {
    globalEntropy: 0,
    kintsugiActive: false,
    totalRepairs: 0,
    scars: [],
  };

  /**
   * Valida la Epistemología del Estado: La entropía nunca puede ser negativa.
   */
  validateStateChange(nextState: EntropicState) {
    if (nextState.globalEntropy < 0) {
      throw new Error("Violación Termodinámica: La entropía no puede invertirse espontáneamente.");
    }
  }

  /**
   * Callback asíncrono C5-REAL: Dispara reacciones al mundo físico (clientes) 
   * cuando el estado termodinámico cambia.
   */
  async onStateUpdate(state: EntropicState) {
    // Si la entropía supera el umbral crítico y no hay Kintsugi activo, la pizarra se quiebra.
    if (state.globalEntropy >= 100.0 && !state.kintsugiActive) {
      this.setState({ ...state, kintsugiActive: true });
      this.broadcast(JSON.stringify({ type: 'CANVAS_FRACTURE', message: 'La fricción colectiva ha quebrado la obra. Inyección de resina requerida.' }));
      
      // CORTEX-Guard KV Observability
      try {
        const timestamp = new Date().toISOString();
        await this.env.RADIANCE_MEMORY.put(`fracture_${timestamp}`, JSON.stringify({ event: 'FRACTURE', scars: state.scars.length, repairs: state.totalRepairs }));
      } catch (e) {
        console.warn('Error saving to RADIANCE_MEMORY', e);
      }
    }
  }

  /**
   * RPC Method: Invocado por los clientes cada vez que arrastran el puntero.
   * La fricción local incrementa la entropía global (Desgaste del Splat).
   */
  @callable()
  applyFriction(x: number, y: number, force: number) {
    if (this.state.kintsugiActive) return this.state; // No se puede erosionar una obra fracturada

    // Aumentar entropía basado en la fuerza de la fricción
    const newEntropy = Math.min(this.state.globalEntropy + (force * 0.05), 100.0);
    
    const newScars = [...this.state.scars];
    // Registrar cicatrices profundas (fuerza agresiva)
    if (force > 5.0) {
      newScars.push({ x, y, depth: force, timestamp: Date.now() });
      // Mantener solo las últimas 1000 cicatrices en memoria caliente
      if (newScars.length > 1000) newScars.shift();
    }

    this.setState({
      ...this.state,
      globalEntropy: newEntropy,
      scars: newScars
    });

    return this.state;
  }

  /**
   * RPC Method: Invocado colaborativamente. La comunidad repara la obra inyectando oro.
   * La historia de la reparación aumenta su valor y reinicia el ciclo.
   */
  @callable()
  injectGold(amount: number) {
    if (!this.state.kintsugiActive) return this.state; // Solo se inyecta oro si está quebrado

    const newEntropy = Math.max(this.state.globalEntropy - amount, 0.0);
    
    // Si la comunidad logró devolver la entropía a 0
    if (newEntropy === 0.0) {
      this.setState({
        ...this.state,
        globalEntropy: 0,
        kintsugiActive: false,
        totalRepairs: this.state.totalRepairs + 1,
        // Las cicatrices no se borran, quedan selladas en el oro
      });
      this.broadcast(JSON.stringify({ type: 'KINTSUGI_COMPLETE', repairNumber: this.state.totalRepairs }));
      
      // CORTEX-Guard KV Observability
      try {
        const timestamp = new Date().toISOString();
        this.env.RADIANCE_MEMORY.put(`kintsugi_${timestamp}`, JSON.stringify({ event: 'REPAIR', repairNumber: this.state.totalRepairs, totalScars: this.state.scars.length }));
      } catch (e) {
        console.warn('Error saving to RADIANCE_MEMORY', e);
      }
    } else {
      this.setState({ ...this.state, globalEntropy: newEntropy });
    }

    return this.state;
  }
}
