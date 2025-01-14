import React from 'react'

type Size = 'small' | 'medium' | 'large'

interface LoadingSpinnerProps {
  size?: Size,
  containerClassName?: string,
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  containerClassName = 'text-primary',
  className = 'border-primary'
}) => {
  const sizeClasses: Record<Size, string> = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  }

  return (
    <div
      className={`flex flex-col gap-y-2 ${containerClassName}`}
      role="status"
    >
      <div className={`inline-block ${sizeClasses[size]} border-t-transparent border-solid rounded-full animate-spin ${className}`}/>
      <span>Laden...</span>
    </div>
  )
}

export default LoadingSpinner
