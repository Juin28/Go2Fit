import { observer } from "mobx-react-lite"
import { ProfileView } from "../views/profileView"

export const Profile = observer(function SummaryRender(props) {
    return (
        <ProfileView/>
    )
})
