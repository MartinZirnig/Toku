using BackendInterface;

namespace BackendInterface;
public interface IDatabaseServiceProvider
{
    //static abstract IDataService GetDataServiceStatic();
    //static abstract IUserService GetUserServiceStatic();
    //static abstract IFileService GetFileServiceStatic();
    IDataService GetDataService();
    IUserService GetUserService();
    IFileService GetFileService();


}
