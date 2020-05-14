import React from 'react';
import clsx from 'clsx';
import { useDrag } from 'react-dnd';
import { createUseStyles, useTheme } from 'react-jss';

export interface ICardProps {
  isBlack?: boolean;
  message: string;
  id: string;
  [key: string]: any;
}

const useStyles = createUseStyles({
  card: {
    width: 150,
    maxWidth: 'calc(50vw - 42px)',
    textAlign: 'center',
    border: '1px solid dimgrey',
    borderRadius: 5,
    height: 170,
    backgroundColor: 'white',
    color: 'black',
    margin: 10,
    padding: 10,
    flexShrink: 0,

    '&.black': {
      backgroundImage: 'linear-gradient(#231f20, #231f20 75%, #333)',
      color: 'white',
    },
    '&.selected': {
      backgroundColor: 'blue',
      color: 'white',
    },
  },
});
export default ({
  isBlack = false,
  message,
  id,
  selected,
  className,
  ...props
}: ICardProps) => {
  const theme = useTheme();
  const classes = useStyles({ theme });
  const [{ opacity }, dragRef] = useDrag({
    item: { type: 'CARD', message, id },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    canDrag: () => !isBlack,
  });
  return (
    <div
      className={clsx(classes.card, { black: isBlack, selected }, className)}
      {...props}
      ref={dragRef}
      style={{ opacity }}
    >
      <span dangerouslySetInnerHTML={{ __html: message }} />
    </div>
  );
};
