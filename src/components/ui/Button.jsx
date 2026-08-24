
export default function Button({ children, variant = 'primary', onClick, className='', type='button', ...rest }){
  const base = 'btn ' + (variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-outline');
  return (
    <button type={type} className={base + ' ' + className} onClick={onClick} {...rest}>{children}</button>
  );
}
