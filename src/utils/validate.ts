import { UserNameOrEmailPassword } from "./UserNameOrEmailPassword";

export const validate = (options: UserNameOrEmailPassword) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Not a valid email",
      },
    ];
  } else if (options.username.length <= 3) {
    return [
      {
        field: "username",
        message: "Username length should be greater than 3",
      },
    ];
  } else if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Username cannot include @",
      },
    ];
  } else if (options.password.length <= 7) {
    return [
      {
        field: "password",
        message: "Password length should be greater than 8",
      },
    ];
  }

  return null;
};
