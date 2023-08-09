import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const PORTAL_MODAL = 'portal-root';

interface InCorrectModalProps {
  toggleModal: () => void;
}

const InCorrectModal = ({ toggleModal }: InCorrectModalProps): React.ReactPortal | null => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        toggleModal();
      }, 500);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [toggleModal]);

  const modalRoot = document.getElementById(PORTAL_MODAL);

  if (modalRoot == null) {
    return null;
  }

  return createPortal(
    <div className={`absolute ml-[34%] ${isVisible ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
      <img src={'./assets/incorrect.svg'} alt="InCorrect" />
    </div>,
    modalRoot
  );
};

export default InCorrectModal;