import React from 'react'

type Size = 'small' | 'medium' | 'large'

interface LoadingSpinnerProps {
  size?: Size,
  containerClassName?: string,
  className?: string
}

/**
 * A component to show a spinning loading indication
 * @param size The size of the spinner
 * @param containerClassName The style overwrite for the container
 * @param className The style overwrite of the spinner itself
 * @constructor
 */
const LoadingSpinner = ({
  size = 'medium',
  containerClassName = 'text-primary',
  className = 'border-primary'
}: LoadingSpinnerProps) => {
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
      <div
        className={`inline-block ${sizeClasses[size]} border-t-transparent border-solid rounded-full animate-spin ${className}`}/>
      <span>Laden...</span>
    </div>
  )
}

export default LoadingSpinner
