import { Footer } from '@src/main/components/footer/Footer'
import { Header } from '@src/main/components/header/Header'
import { Section } from '@src/main/components/section/Section'
import { useAppDataContext } from '@src/main/context/AppDataContext'

const App = () => {
    const { appSections } = useAppDataContext()

    return (
        <main className={'main'}>
            <Header />
            {appSections.map((section) => (
                <Section key={section.id} section={section} />
            ))}
            <Footer />
        </main>
    )
}

export default App
