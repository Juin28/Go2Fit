import { observer } from "mobx-react-lite"
import { ExercisesView } from "../views/exercisesView"

export const Exercises = observer(function SummaryRender(props) {
    return (
        <ExercisesView/>
    )
})
