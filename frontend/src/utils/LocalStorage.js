
const getData = (key) => {
    try {
        const data = localStorage.getItem(key);
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        return null;
    }
};

const setData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch (error) {
        console.error(error);
    }
};

export { getData, setData };