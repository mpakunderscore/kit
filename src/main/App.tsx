import { Footer } from '@src/main/components/footer/Footer'
import { Header } from '@src/main/components/header/Header'
import { Section } from '@src/main/components/section/Section'
import { useMainContext } from '@src/main/context/MainContext'

const App = () => {
    const {} = useMainContext()
    return (
        <main className={'main'}>
            <Header />
            <Section />
            <Section />
            <Footer />
        </main>
    )
}

export default App
