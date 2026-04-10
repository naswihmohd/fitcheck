interface BuyNowButtonProps {
  className?: string;
  buttonText?: string;
  [key: string]: unknown;
}

const BuyNowButton = ({
  className,
  buttonText = 'Buy now',
}: BuyNowButtonProps) => {
  return (
    <button type="button" className={className}>
      {buttonText}
    </button>
  );
};

export default BuyNowButton;
