import { observer } from "mobx-react-lite"
import { shoppingList } from "../utilities"
import { SummaryView } from "../views/summaryView"

export const Summary = observer(function SummaryRender(props) {
    return (
        <SummaryView
            people={props.model.numberOfGuests}
            ingredients={shoppingList(props.model.dishes)}
        />
    )
})
