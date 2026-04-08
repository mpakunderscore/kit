import type { ReactNode } from 'react'

type SectionProps = {
    readonly children: ReactNode
}

export const Section = ({ children }: SectionProps) => {
    return (
        <section className={'section'}>
            {children}
        </section>
    )
}
