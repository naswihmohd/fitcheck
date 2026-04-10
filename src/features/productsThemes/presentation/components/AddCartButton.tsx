interface AddCartButtonProps {
  className?: string;
  buttonText?: string;
  [key: string]: unknown;
}

const AddCartButton = ({
  className,
  buttonText = 'Add to cart',
}: AddCartButtonProps) => {
  return (
    <button type="button" className={className}>
      {buttonText}
    </button>
  );
};

export default AddCartButton;
