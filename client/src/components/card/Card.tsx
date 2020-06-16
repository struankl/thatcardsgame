import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useDrag } from 'react-dnd';
import { createUseStyles, useTheme } from 'react-jss';
import {ReactComponent as Cards} from "../../icons/cards.svg";

export interface ICardProps {
  isBlack?: boolean;
  message: string;
  id: string;
  suppressTag?: boolean;
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',

    '&.black': {
      backgroundImage: 'linear-gradient(#231f20, #231f20 75%, #333)',
      color: 'white',
      fill: 'white',
      stroke: 'white'
    },
    '&.selected': {
      backgroundColor: 'blue',
      color: 'white',
    },
  },
  'cards-icon': {
    height: 11,
    marginRight: 4,
    width: 'auto'
  },
  'cards-tag': {
    fontSize: 10,
    display: 'flex',
    justifyContent: 'center'
  }
});
export default ({
  isBlack = false,
  message,
  id,
  selected,
  className = '',
  suppressTag = false,
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
  const textRef = useRef<any>();

  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const inner = textRef.current?.offsetHeight;
    const outer = textRef.current?.parentElement?.offsetHeight;
    if (
      !className.includes('hidden') &&
      !className.includes('invisible')
    ) {
      console.log({inner, outer});
      if ((inner || 0) > (outer || 31) - 30) {
        setFontSize((current) => {
          const factor = 0.99;
          console.log('setting font size to', current * factor);
          return current * factor;
        });
      }
      if ((inner || 0) < (outer || 0) - 50) {
        console.log('resetting font size to 100');
        setFontSize(100);
      }
    }

  }, [message, className, fontSize]);

  return (
    <div
      className={clsx(classes.card, { black: isBlack, selected }, className)}
      {...props}
      ref={dragRef}
      style={{ opacity }}
    >
      <span
        ref={textRef}
        style={{ fontSize: `${fontSize}%` }}
        dangerouslySetInnerHTML={{ __html: message }}
      />
      {!suppressTag && <span className={classes['cards-tag']}><Cards className={classes['cards-icon']} /> thatcardsgame.com</span>}
    </div>
  );
};
