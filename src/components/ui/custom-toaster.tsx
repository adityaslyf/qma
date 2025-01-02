import { Toaster } from 'react-hot-toast'

export function CustomToaster() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        className: 'bg-background text-foreground border border-border',
        success: {
          className: 'bg-background text-foreground border-green-500',
          iconTheme: {
            primary: '#22c55e',
            secondary: 'white',
          },
        },
        error: {
          className: 'bg-background text-foreground border-red-500',
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  )
}
