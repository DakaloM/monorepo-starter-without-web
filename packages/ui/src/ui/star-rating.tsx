import { StarIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const StarRating = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, onChange, type, ...props }, ref) => {
    const stars = new Array(5).fill(false).map((_, i) => +value >= i + 1);

    return (
      <div className="flex-grow flex mx-auto gap-2 self-center my-auto">
        {stars.map((star, i) => {
          const className = cn('hover:scale-110 cursor-pointer', {
            'fill-primary text-primary': star,
            'hover:text-primary': !star,
          });

          return (
            <StarIcon
              onClick={(e) =>
                onChange({ ...e, target: { ...e.target, value: (i + 1).toString() } } as any)
              }
              key={i}
              className={className}
            />
          );
        })}
      </div>
    );
  },
);
StarRating.displayName = 'StarRating';

export { StarRating };
