const stringComparator = (a, b) => {
    return new Intl.Collator().compare(a, b);
} 

export default stringComparator;