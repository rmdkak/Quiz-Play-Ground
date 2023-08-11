import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { modalStateStore } from 'store';

import incorrect from '../../../assets/incorrect.svg';

export const PORTAL_MODAL = 'portal-root';

const InCorrectModal = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const { closeInCorrectModal } = modalStateStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        closeInCorrectModal();
      }, 500);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const modalRoot = document.getElementById(PORTAL_MODAL);

  if (modalRoot == null) {
    return null;
  }

  return createPortal(
    <div
      className={`absolute top-[50%] left-[50%] -translate-x-center -translate-y-center ${
        isVisible ? 'animate-fadeIn' : 'animate-fadeOut'
      }`}
    >
      <img src={incorrect} alt="InCorrect" />
    </div>,
    modalRoot
  );
};

export default InCorrectModal;
