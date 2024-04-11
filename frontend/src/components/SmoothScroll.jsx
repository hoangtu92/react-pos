import {useEffect} from "react";

const SmoothScroll = ({children}) => {

    // useEffect is used to perform side effects in functional components.
    // Here, it's used to register scroll events and update scrollSpy when the component mounts.
    useEffect(() => {


    }, []);

    return <>
        <div className={"overflow-auto vh-100  flex-grow-1"}>
            {children}
        </div>
    </>
}

export default SmoothScroll;
