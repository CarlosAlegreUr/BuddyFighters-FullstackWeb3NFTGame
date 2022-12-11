import Link from "next/link"

export default function GoToButton({text, href}) {
    return (
        <Link href={href}>
            <button> {text} </button>
        </Link>
    )
}
