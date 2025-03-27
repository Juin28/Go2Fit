import { observer } from "mobx-react-lite"
import { TrainingView } from "../views/trainingView"

export const Training = observer(function SummaryRender(props) {
    return (
        <TrainingView/>
    )
})
