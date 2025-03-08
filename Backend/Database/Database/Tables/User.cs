using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Database.Tables
{
    public class User : HasTimeFlag
    {
        internal uint UserId {  get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }

        public bool IsDeleted { get; set; }

        internal uint GetId(MysqlContext context)
        {
            return Validify(context).UserId;
        }
        internal User Validify(MysqlContext context)
        {
            var set = (IEnumerable<User>)context.Users;

            if (!string.IsNullOrWhiteSpace(Name))
                set = set.Where(x => x.Name == Name);
            if (!string.IsNullOrEmpty(Email))
                set = set.Where(x => x.Email == Email);
            if (!string.IsNullOrWhiteSpace(Password))
                set = set.Where(x => x.Password == Password);

            var result = set.FirstOrDefault();
            if (result is not null)
                return result;

            context.Users.Add(this);
            context.SaveChanges();

            return this;
        }
        internal bool Exists(MysqlContext context)
        {
            var set = (IEnumerable<User>)context.Users;

            if (!string.IsNullOrWhiteSpace(Name))
                set = set.Where(x => x.Name == Name);
            if (!string.IsNullOrEmpty(Email))
                set = set.Where(x => x.Email == Email);
            if (!string.IsNullOrWhiteSpace(Password))
                set = set.Where(x => x.Password == Password);

            var result = set.FirstOrDefault();
            if (result is not null)
                return true;
            return false;
        }
    }
}
