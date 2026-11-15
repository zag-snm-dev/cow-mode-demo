import { Link, type LinkProps } from 'react-router'
import { buttonClass, type ButtonVariant } from './buttonStyles'

type Props = LinkProps & { variant?: ButtonVariant }

export function LinkButton({ variant = 'primary', className = '', ...props }: Props) {
  return <Link className={buttonClass(variant, className)} {...props} />
}