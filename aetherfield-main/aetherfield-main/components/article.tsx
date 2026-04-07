export function Container({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-12">
            {children}
        </div>
    )
}

export function Paragraph({ heading, text }: { heading: string; text: string }) {
    return (
        <div className="flex flex-col gap-8">
            <h2 className="paragraph-1-medium">{heading}</h2>
            <p className="article-paragraph">{text}</p>
        </div>
    )
}

export function BulletList({ heading, listItems }: { heading: string; listItems: string[] }) {
    return (
        <div className="flex flex-col gap-8">
            <h2 className="paragraph-1-medium">{heading}</h2>
            <ul className="article-paragraph list-disc pl-8">
                {listItems.map((item, index) => (
                    <li key={index} className="py-1">{item}</li>
                ))}
            </ul>
        </div>
    )
}