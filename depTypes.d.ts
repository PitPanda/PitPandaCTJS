/// <reference no-default-lib="true" />
/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

interface JavaColor {
  r: number,
  g: number,
  b: number,
  a: number,
}

declare module 'Elementa/index'{
  abstract class UIComponent{
    parent: UIComponent;
    children: UIComponent[];
    addChild(comp: UIComponent): this;
    addChildren(...comps: UIComponent[]): this;
    removeChild(comp: UIComponent): this;
    clearChildren(): this;
    enableEffect(effect: Effect): this;
    enableEffects(...effects: Effect[]): this;
    setX(constraint: XConstraint): this;
    setY(constraint: YConstraint): this;
    setWidth(constraint: WidthConstraint): this;
    setHeight(constraint: HeightConstraint): this;
    setRadius(constraint: RadiusConstraint): this;
    setTextScale(constraint: HeightConstraint): this;
    setColor(constraint: ColorConstraint): this;
    getConstraints(): Constraints;
    getLeft(): number;
    getTop(): number;
    getRight(): number;
    getBottom(): number;
    getWidth(): number;
    getHeight(): number;
    getRadius(): number;
    getTextScale(): number;
    getColor(): JavaColor;
    isHovered(): boolean;
    draw(): void;
    makeAnimation(): AnimatingConstraints;
    onMouseEnter(cb: () => void): this;
    onMouseLeave(cb: () => void): this;
    onMouseClick(cb: (x: number, y: number, btn: number) => void): this;
  }

  class UIConstraints{
    x: XConstraint;
    y: YConstraint;
    width: WidthConstraint;
    height: HeightConstraint;
    radius: RadiusConstraint;
    textScale: HeightConstraint;
    color: ColorConstraint;
    getX(): number;
    withX(constraint: XConstraint): this;
    getY(): number;
    withY(constraint: YConstraint): this;
    getWidth(): number;
    withWidth(constraint: WidthConstraint): this;
    getHeight(): number;
    withHeight(constraint: HeightConstraint): this;
    getRadius(): number;
    withRadius(constraint: RadiusConstraint): this;
    getTextScale(): number;
    withTextScale(constraint: HeightConstraint): this;
    getColor(): JavaColor
    withColor(constraint: ColorConstraint): this;
    animationFrame(): void;
    finish(): UIComponent
    copy(): UIConstraints;
  }
  
  interface Constraints{
  
  }

  interface SuperConstraint<T> {
    cachedValue: T;
    recalculate: Boolean;
    constrainTo?: UIComponent;

    animationFrame(): void

    to(component: UIComponent): this
  }
  
  interface XConstraint implements SuperConstraint<number>{
    getXPositionImpl(component: UIComponent): number;
    getXPosition(component: UIComponent): number;
  }
  
  interface YConstraint implements SuperConstraint<number>{
    getYPositionImpl(component: UIComponent): number;
    getYPosition(component: UIComponent): number;
  }
  
  interface WidthConstraint implements SuperConstraint<number>{
    getWidthImpl(component: UIComponent): number;
    getWidth(component: UIComponent): number;
  }
  
  interface HeightConstraint implements SuperConstraint<number>{
    getHeightImpl(component: UIComponent): number;
    getHeight(component: UIComponent): number;
  }
  
  interface RadiusConstraint implements SuperConstraint<number>{
    getRadiusImpl(component: UIComponent): number;
    getRadius(component: UIComponent): number;
  }
  
  interface ColorConstraint implements SuperConstraint<JavaColor>{
    getColorImpl(component: UIComponent): JavaColor;
    getColor(component: UIComponent): JavaColor;
  }

  interface PositionConstraint implements XConstraint, YConstraint{}
  interface SizeConstraint implements WidthConstraint, HeightConstraint, RadiusConstraint{}

  interface GeneralConstraint  implements PositionConstraint, SizeConstraint{
    getXValue(component: UIComponent): number;
    getYValue(component: UIComponent): number;
  }
  
  interface MasterConstraint implements PositionConstraint, SizeConstraint{}
  
  interface Effect {
    beforeDraw(component: UIComponent): void,
    beforeChildrenDraw(component: UIComponent): void,
    afterDraw(component: UIComponent): void,
  }

  class Window extends UIComponent{};
  class UIContainer extends UIComponent{};
  class UIBlock extends UIComponent{};
  class UIRoundedRectangle extends UIComponent{};
  class UICircle extends UIComponent{};
  class UIPoint extends UIComponent{};
  class UIShape extends UIComponent{};
  class UIText extends UIComponent{};
  class UIWrappedText extends UIComponent{};
  class UITextInput extends UIComponent{};
  class UIImage extends UIComponent{};

  class PixelConstraint implements MasterConstraint{
    new(value: number, alignOpposite?: boolean): this;
  };
  class CenterConstraint implements PositionConstraint{};
  class SiblingConstraint implements PositionConstraint{
    new(alignOpposite?: boolean): this;
  };
  class CramSiblingConstraint implements SiblingConstraint{};
  class RelativeConstraint implements GeneralConstraint{
    new(value?: number)
  };
  class AspectConstraint implements MasterConstraint{
    new(value?: number): this;
  };
  class TextAspectConstraint implements WidthConstraint, HeightConstraint{};
  class ImageAspectConstraint implements MasterConstraint{};
  class FillConstraint implements SizeConstraint{};
  class ChildBasedSizeConstraint implements SizeConstraint{};
  class ChildBasedMaxSizeConstraint implements SizeConstraint{};
  class ScaledTextConstraint implements SizeConstraint{
    new(scale: number): this;
  };
  class AdditiveConstraint implements MasterConstraint{
    new(constraint1: SuperConstraint<number>, constraint2: SuperConstraint<number>): this;
  };
  class SubtractiveConstraint implements MasterConstraint{
    new(constraint1: SuperConstraint<number>, constraint2: SuperConstraint<number>): this;
  };
  class MinConstraint implements MasterConstraint{
    new(constraint: SuperConstraint<number>, minConstraint: SuperConstraint<number>): this;
  };
  class MaxConstraint implements MasterConstraint{
    new(constraint: SuperConstraint<number>, maxConstraint: SuperConstraint<number>): this;
  };
  class ConstantColorConstraint implements ColorConstraint{
    new(color: JavaColor): this;
  };
  class RainbowColorConstraint implements ColorConstraint{
    new(alpha: number, speed: number): this;
  };

  class ScissorEffect extends UIConstraint{};
  class StencilEffect extends UIConstraint{};

  class AnimationStrategy {
    getValue(percentComplete: number): number;
  }

  enum Animations {
    LINEAR,
    IN_QUAD,
    OUT_QUAD,
    IN_OUT_QUAD,
    IN_CUBIC,
    OUT_CUBIC,
    IN_OUT_CUBIC,
    IN_QUART,
    OUT_QUART,
    IN_OUT_QUART,
    IN_QUINT,
    OUT_QUINT,
    IN_OUT_QUINT,
    IN_SIN,
    OUT_SIN,
    IN_OUT_SIN,
    IN_EXP,
    OUT_EXP,
    IN_OUT_EXP,
    IN_CIRCULAR,
    OUT_CIRCULAR,
    IN_OUT_CIRCULAR,
    IN_ELASTIC,
    OUT_ELASTIC,
    IN_OUT_ELASTIC,
    IN_BOUNCE,
    OUT_BOUNCE,
    IN_OUT_BOUNCE,
  }

  class AnimatingConstraints extends UIConstraints {
    completeAction: () => void;
    begin(): void;
    setXAnimation(strategy: Animations, time: number, newConstraint: PositionConstraint, delay: number): this;
    setYAnimation(strategy: Animations, time: number, newConstraint: PositionConstraint, delay: number): this;
    setWidthAnimation(strategy: Animations, time: number, newConstraint: SizeConstraint, delay: number): this;
    setHeightAnimation(strategy: Animations, time: number, newConstraint: SizeConstraint, delay: number): this;
    setRadiusAnimation(strategy: Animations, time: number, newConstraint: RadiusConstraint, delay: number): this;
    setTextScaleAnimation(strategy: Animations, time: number, newConstraint: HeightConstraint, delay: number): this;
    setColorAnimation(strategy: Animations, time: number, newConstraint: ColorConstraint, delay: number): this;
    onComplete(method: () => void): this;
    animationFrame(): void;
  }
}
