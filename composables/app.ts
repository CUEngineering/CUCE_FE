export const getCacheFromState = <Data = unknown>(key: string) => {
  try {
    const data = useState(key).value;
    return data as Data | undefined;
  } catch (e) {
    console.log(
      `Error getting cached data from state for key "${key}" ====> `,
      e,
    );
  }

  return undefined;
};

export const getCacheKeyFor = (
  key: string | MaybeRefOrGetter<string>,
) => {
  const authStore = useAuthStore();
  key = toValue(key);
  return `${authStore.role ?? 'UNLOGGED'}-${key}:::token:::${authStore.token}`;
};
