import { Footer } from '@src/main/components/footer/Footer'
import { Header } from '@src/main/components/header/Header'
import { Section } from '@src/main/components/section/Section'
import { useAppDataContext } from '@src/main/context/AppDataContext'
import { useFontsReady } from '@src/main/hooks/useFontsReady'

const App = () => {
    const fontsReady = useFontsReady()
    const { appSections } = useAppDataContext()

    if (!fontsReady) {
        return <div aria-busy={'true'} aria-label={'Loading'} className={'loading'} />
    }

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
