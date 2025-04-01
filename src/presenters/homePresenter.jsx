import { observer } from "mobx-react-lite"
import { HomeView } from "../views/homeView"

export const Home = observer(function SummaryRender(props) {
    const { model } = props

    function sessionChosenACB(sessionId) {
        model.setCurrentTrainingSessionID(sessionId)
    }

    return (
        <HomeView
            sessionChosen={sessionChosenACB}
        />
    )
})
