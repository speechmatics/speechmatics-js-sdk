'use client';
const Card = ({
  children,
  heading,
}: {
  children: React.ReactNode;
  heading?: string;
}) => {
  return (
    <div className="card bg-base-100 shadow-md card-bordered h-full">
      {heading && (
        <div className="bg-gray-50 p-5">
          <h3 className="card-title">{heading}</h3>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
