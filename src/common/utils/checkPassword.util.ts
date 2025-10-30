export const checkPassword = (
  password: string,
): { isVaild: boolean; message?: string } => {
  const isOnlyLatinNumbersAndSymb =
    /^[A-Za-z0-9!@#$%^&*()_\-+=\[{\]};:'",<.>/?~|\\]*$/;
  const isUppserAndLower = /^(?=.*[a-z])(?=.*[A-Z]).+$/;
  const isOneNumber = /^(?=.*\d).+$/;
  const isSymbol = /^(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?~|\\]).+$/;
  const isThreeSymbols = /^(?!.*(.)\1{2,}).+$/;

  if (!isOnlyLatinNumbersAndSymb.test(password)) {
    return {
      isVaild: false,
      message: 'Only Latin letters, numbers and special symbols',
    };
  } else if (password.length < 8) {
    return { isVaild: false, message: '8 or more characters' };
  } else if (!isUppserAndLower.test(password)) {
    return { isVaild: false, message: 'Upper & lowercase letters' };
  } else if (!isOneNumber.test(password)) {
    return { isVaild: false, message: 'At least one number' };
  } else if (!isSymbol.test(password)) {
    return { isVaild: false, message: 'At least one special symbol' };
  } else if (!isThreeSymbols.test(password)) {
    return {
      isVaild: false,
      message: 'No sequences of three or more identical characters',
    };
  }

  return { isVaild: true };
};
