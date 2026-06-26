import { create } from 'zustand';

interface CarouselState {
  activeIndex: number;
  targetAngle: number;
  itemCount: number;
  nextCard: () => void;
  prevCard: () => void;
  setCard: (index: number) => void;
  setCount: (count: number) => void;
}

export const useCarouselStore = create<CarouselState>((set) => ({
  activeIndex: 0,
  targetAngle: 0,
  itemCount: 0,
  setCount: (count) => set({ itemCount: count }),
  nextCard: () => set((state) => {
    if (state.itemCount === 0) return state;
    const nextIndex = (state.activeIndex + 1) % state.itemCount;
    return {
      activeIndex: nextIndex,
      targetAngle: -nextIndex * (Math.PI * 2 / state.itemCount)
    };
  }),
  prevCard: () => set((state) => {
    if (state.itemCount === 0) return state;
    const prevIndex = (state.activeIndex - 1 + state.itemCount) % state.itemCount;
    return {
      activeIndex: prevIndex,
      targetAngle: -prevIndex * (Math.PI * 2 / state.itemCount)
    };
  }),
  setCard: (index) => set((state) => {
    if (state.itemCount === 0) return state;
    return {
      activeIndex: index,
      targetAngle: -index * (Math.PI * 2 / state.itemCount)
    };
  }),
}));
