import { useSelector } from "react-redux"
import { chatAppSelector } from "../../redux/ChatAppReducer"
import styles from "./Heading.module.css"
import { Outlet } from "react-router-dom";

export function Heading() {
  const { user } = useSelector(chatAppSelector);
  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.userInfo}>
          <p>Welcome, {user.name}</p>
          <img
            className={styles.userImage}
            src="https://ui-avatars.com/api/?name=User&background=random"
            alt="No Image"
          />
        </div>
      </nav>

      {/* Flex wrapper for sidebar and main content */}
      <div className={styles.flexContainer}>
        <Outlet />
      </div>
    </>
  );
}
