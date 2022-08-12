// This class helps us to create WHERE clause of the mongoDB Query
// base : mongoDB query, Ex: Product.find()
// bigQ : The Query that came in with req, Ex:search=coder&page=2&category=shortsleeve&rating[gte]=4

class WhereClause{

    constructor(base,bigQ){
        this.base = base;
        this.bigQ = bigQ;
    }
    

    search(){
        const searchWord = this.bigQ.search ? {
            name:{
                $regex: this.bigQ.search,
                $options:'i'
            }
        } : {}

        this.base = this.base.find({...searchWord})
        return this
    }

    filter(){
        const copyQ = {...this.bigQ};

        delete copyQ["search"];
        delete copyQ["page"];
        delete copyQ["limit"];

        // convert copyQ(JSON) into a string
        let stringOfCopyQ = JSON.stringify(copyQ);

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)/g,m => `$${m}`)

        const jsonCopyOfQ = JSON.parse(stringOfCopyQ);
        this.base = this.base.find(jsonCopyOfQ);
        return this;
    }

    pager(resultPerPage){
        let currentPage = 1;
        if(this.bigQ.page){
            currentPage = this.bigQ.page;
        }

        const skipVal = resultPerPage * (currentPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }

}

module.exports = WhereClause