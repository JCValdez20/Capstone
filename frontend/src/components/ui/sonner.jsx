import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      expand={true}
      duration={4000}
      toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgb(229, 231, 235)',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          fontSize: '14px',
          fontWeight: '500',
        },
        className: 'group toast group-[.toaster]:bg-white/95 group-[.toaster]:backdrop-blur-sm group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
        descriptionClassName: 'group-[.toast]:text-gray-600',
        actionButtonClassName: 'group-[.toast]:bg-red-800 group-[.toast]:text-white group-[.toast]:hover:bg-red-900',
        cancelButtonClassName: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:hover:bg-gray-200',
      }}
      {...props} 
    />
  );
}

export { Toaster }
