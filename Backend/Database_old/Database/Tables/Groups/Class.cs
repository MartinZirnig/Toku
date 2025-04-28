using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Database.Tables
{
    public class Class : HasTimeFlag
    {
        // general informations
        internal uint ClassId { get; set; }
        internal List<User> Users { get; set; }
        internal List<ClassOperation> OperationsHistory { get; set; }
        internal List<Message> Messages { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }


        // user roles
        internal List<User> Admins { get; set; }
        internal List<User> ClassDescriber { get; set; }
        internal List<User> ChatManager { get; set; }

        internal uint GetId(MysqlContext context)
        {
            return Validify(context).ClassId;
        }
        internal Class Validify(MysqlContext context)
        {
            var set = (IQueryable<Class>)context.Classes;

            if (string.IsNullOrWhiteSpace(Name))
                set = set.Where(x => x.Name == Name);
            if (string.IsNullOrWhiteSpace(Description))
                set = set.Where(set => set.Description == Description);

            var result = set.FirstOrDefault();
            if (result is not null)
                return result;

            context.Classes.Add(this);
            return this;
        }
        internal bool Exists(MysqlContext context)
        {
            var set = (IQueryable<Class>)context.Classes;

            if (string.IsNullOrWhiteSpace(Name))
                set = set.Where(x => x.Name == Name);
            if (string.IsNullOrWhiteSpace(Description))
                set = set.Where(set => set.Description == Description);

            var result = set.FirstOrDefault();
            return result is not null;
        }
    }
}
