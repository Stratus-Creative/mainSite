import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

interface Props {
  children: ReactNode;
  /** ms — gap between each child's entrance */
  step?: number;
  /** ms — base delay applied before the stagger sequence starts */
  start?: number;
}

interface InjectedStyle {
  style?: CSSProperties;
}

/**
 * Adds an incrementally larger `--motion-delay` CSS var to each direct child.
 * Children must accept a `style` prop and read `--motion-delay` (FadeIn /
 * ScrollReveal both do this automatically).
 */
export function Stagger({ children, step = 80, start = 0 }: Props) {
  const arr = Children.toArray(children);
  return (
    <>
      {arr.map((child, i) => {
        if (!isValidElement(child)) return child;
        const existingStyle =
          ((child as ReactElement<InjectedStyle>).props.style as CSSProperties | undefined) ?? {};
        const delay = start + i * step;
        return cloneElement(child as ReactElement<InjectedStyle>, {
          style: {
            ...existingStyle,
            ["--motion-delay" as string]: `${delay}ms`,
          },
        });
      })}
    </>
  );
}
