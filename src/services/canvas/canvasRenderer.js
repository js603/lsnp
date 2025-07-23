// Canvas rendering service - 이미지 처리 기능 제거됨
import { useEffect } from 'react';

// Canvas rendering class - 단순 스텁
class CanvasRenderer {
  constructor() {
    // 모든 상태 및 메서드는 비어있는 스텁으로 대체
    this.canvas = null;
    this.width = 0;
    this.height = 0;
  }

  // 단순화된 초기화 메서드
  initialize() {
    // 아무 작업도 수행하지 않음
    return this;
  }

  // 비어있는 메서드들
  clear() {}
  startRendering() {}
  stopRendering() {}
  render() {}
  addToRenderQueue() {}

  // 단순화된 배경 그리기 메서드 - 아무 작업도 수행하지 않음
  drawBackgroundScene() {
    // 그래픽 처리 없음
    return Promise.resolve();
  }

  // 단순화된 실루엣 그리기 메서드 - 아무 작업도 수행하지 않음
  drawSilhouette() {
    // 그래픽 처리 없음
    return Promise.resolve();
  }

  // 단순화된 이펙트 그리기 메서드 - 아무 작업도 수행하지 않음
  drawEffect(description, options = {}) {
    const { duration = 2000 } = options;

    // 그래픽 처리 없이 타이머만 반환
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  // 단순화된 유틸리티 메서드들 - 기본값만 반환
  darkenColor(color) {
    return color;
  }

  lightenColor(color) {
    return color;
  }

  blendColors(color1) {
    return color1;
  }

  // 단순화된 효과 렌더링 메서드 추가
  renderEffects() {
    // 아무 작업도 수행하지 않음
    return;
  }
}

// 단순화된 캔버스 렌더러 인스턴스
const canvasRenderer = new CanvasRenderer();

// 단순화된 React 훅 - 렌더러만 반환
export const useCanvasRenderer = () => {
  return canvasRenderer;
};

export default canvasRenderer;