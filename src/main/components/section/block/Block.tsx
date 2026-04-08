import type { ReactNode } from 'react'

type BlockProps = {
    readonly children: ReactNode
}

export const Block = ({ children }: BlockProps) => {
    return (
        <article className={'block'}>
            <div className={'block_content'}>{children}</div>
        </article>
    )
}
