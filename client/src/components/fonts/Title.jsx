export default function Title({ text, variant }) {
    const variantStyles = {
        primary: "text-3xl",
        secondary: "text-xl",
    };

    return (
        <p className={`font-bold ${variantStyles[variant]}`}>{text}</p>
    );
}