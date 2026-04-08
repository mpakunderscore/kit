import { Footer } from '@src/main/components/footer/Footer'
import { Header } from '@src/main/components/header/Header'
import { DataSection } from '@src/main/components/section/DataSection'
import { UserSection } from '@src/main/components/section/UserSection'
import { WebAPISection } from '@src/main/components/section/WebAPISection'

const App = () => {
    return (
        <main className={'main'}>
            <Header />
            <>
                <UserSection />
                <WebAPISection />
                <DataSection />
            </>
            <Footer />
        </main>
    )
}

export default App
