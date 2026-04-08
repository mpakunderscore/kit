type BlockProps = {
    readonly text: string
}

export const Block = ({ text }: BlockProps) => {
    return <div className={'block'}>{text}</div>
}
